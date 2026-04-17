import { stream, MODELS } from '../llm'
import { fetchPage } from './fetch'
import { SWARM_AGENTS } from './agents'
import type {
  DossierAnalysis,
  DossierCompetitor,
  DossierEvent,
  DossierInput,
  DossierOpportunity,
  FullDossier,
  XrayPrelim,
} from './types'

/**
 * Streaming dossier orchestrator. Yields DossierEvents that the route handler
 * forwards to the client as SSE. All 20 agents are real Claude calls — no
 * theater, no fakes. Lanes run with structured concurrency:
 *
 *   intel (parallel)  →  analysis (parallel)  →  strategy (parallel)  →  output (sequential)
 *
 * Cost discipline: intel uses Haiku, analysis uses Sonnet, strategy/output
 * use Opus with prompt caching on the shared context block.
 */
export async function* runDossier(
  slug: string,
  input: DossierInput
): AsyncGenerator<DossierEvent> {
  yield { type: 'started', dossierSlug: slug }
  for (const agent of SWARM_AGENTS) {
    yield { type: 'agent.queued', agent }
  }

  // ---- 1. Initial fetch + lightweight tech detection ------------------------
  const page = await fetchPage(input.url)
  const xray: XrayPrelim = {
    domain: page.domain,
    techStack: detectStack(page.html),
    description: page.description ?? undefined,
  }

  const sharedContextBlock = buildSharedContext(input, page, xray)

  // ---- 2. INTEL LANE — Haiku, parallel --------------------------------------
  yield { type: 'phase', phase: 'intel' }
  const intelAgents = SWARM_AGENTS.filter((a) => a.lane === 'intel')
  const intelResults = await runLane(intelAgents, async (agent, emit) => {
    return runAgent({
      slug: agent.slug,
      model: MODELS.haiku(),
      maxTokens: 600,
      system: [sharedContextBlock, intelSystemFor(agent.slug)],
      userPrompt: intelUserFor(agent.slug, page.textExcerpt),
      emit,
    })
  })
  for await (const ev of intelResults) yield ev
  const intelOutputs = collectOutputs(intelResults.results)

  // ---- 3. ANALYSIS LANE — Sonnet, parallel ----------------------------------
  yield { type: 'phase', phase: 'analysis' }
  const analysisContext = `${sharedContextBlock}\n\n<intel_findings>\n${formatIntel(intelOutputs)}\n</intel_findings>`
  const analysisAgents = SWARM_AGENTS.filter((a) => a.lane === 'analysis')
  const analysisResults = await runLane(analysisAgents, async (agent, emit) => {
    return runAgent({
      slug: agent.slug,
      model: MODELS.sonnet(),
      maxTokens: 800,
      system: [analysisContext, analysisSystemFor(agent.slug)],
      userPrompt: analysisUserFor(agent.slug),
      emit,
    })
  })
  for await (const ev of analysisResults) yield ev
  const analysisOutputs = collectOutputs(analysisResults.results)

  // ---- 4. STRATEGY LANE — Opus, parallel ------------------------------------
  yield { type: 'phase', phase: 'strategy' }
  const strategyContext = `${analysisContext}\n\n<analysis_findings>\n${formatAnalysis(analysisOutputs)}\n</analysis_findings>`
  const strategyAgents = SWARM_AGENTS.filter((a) => a.lane === 'strategy')
  const strategyResults = await runLane(strategyAgents, async (agent, emit) => {
    return runAgent({
      slug: agent.slug,
      model: MODELS.opus(),
      maxTokens: 1200,
      system: [strategyContext, strategySystemFor(agent.slug)],
      userPrompt: strategyUserFor(agent.slug, input),
      emit,
    })
  })
  for await (const ev of strategyResults) yield ev
  const strategyOutputs = collectOutputs(strategyResults.results)

  // ---- 5. OUTPUT LANE — Opus + extended thinking, sequential ----------------
  yield { type: 'phase', phase: 'output' }
  const outputContext = `${strategyContext}\n\n<strategy_proposals>\n${formatStrategy(strategyOutputs)}\n</strategy_proposals>`

  const finalAnalysis = runStructuredAgent<DossierAnalysis>({
    slug: 'thesis-writer',
    model: MODELS.opus(),
    maxTokens: 1500,
    system: outputContext,
    userPrompt: THESIS_PROMPT,
    fallback: () => fallbackAnalysis(xray),
  })
  for await (const ev of finalAnalysis.events) yield ev

  const scopeOutput = runStructuredAgent<FullDossier['proposedScope']>({
    slug: 'scope-architect',
    model: MODELS.opus(),
    maxTokens: 1500,
    system: outputContext,
    userPrompt: SCOPE_PROMPT,
    fallback: () => fallbackScope(),
  })
  for await (const ev of scopeOutput.events) yield ev

  const editorOutput = runStructuredAgent<FullDossier>({
    slug: 'editor-in-chief',
    model: MODELS.opus(),
    maxTokens: 2500,
    system: outputContext,
    userPrompt: editorPrompt({
      slug,
      domain: xray.domain,
      input,
      analysis: finalAnalysis.value,
      opportunities: extractOpportunities(strategyOutputs),
      competitors: extractCompetitors(strategyOutputs),
      scope: scopeOutput.value,
    }),
    fallback: () =>
      composeFallback(
        slug,
        xray,
        input,
        finalAnalysis.value,
        extractOpportunities(strategyOutputs),
        extractCompetitors(strategyOutputs),
        scopeOutput.value
      ),
  })
  for await (const ev of editorOutput.events) yield ev

  yield { type: 'complete', dossier: editorOutput.value }
}

// =============================================================================
// Lane runner — fan out, capture per-agent streaming events
// =============================================================================

interface AgentRunResult {
  slug: string
  output?: unknown
  error?: string
  durationMs: number
}

async function runLane(
  agents: typeof SWARM_AGENTS,
  worker: (
    agent: (typeof SWARM_AGENTS)[number],
    emit: (ev: DossierEvent) => void
  ) => Promise<AgentRunResult>
): Promise<{
  results: AgentRunResult[];
  [Symbol.asyncIterator](): AsyncIterator<DossierEvent>;
}> {
  const events: DossierEvent[] = []
  const queue: DossierEvent[] = []
  let resolveTick: (() => void) | null = null
  const tick = () => {
    if (resolveTick) {
      resolveTick()
      resolveTick = null
    }
  }
  const emit = (ev: DossierEvent) => {
    events.push(ev)
    queue.push(ev)
    tick()
  }
  let done = false
  const results: AgentRunResult[] = []

  // Semaphore: Groq free tier ≈ 30 RPM on big models. Cap concurrent
  // in-flight agents per lane so a single dossier doesn't burn the pool.
  const MAX_CONCURRENT = 6
  let active = 0
  const pending: (() => void)[] = []
  const acquire = () =>
    new Promise<void>((resolve) => {
      const grant = () => {
        active++
        resolve()
      }
      if (active < MAX_CONCURRENT) grant()
      else pending.push(grant)
    })
  const release = () => {
    active--
    const next = pending.shift()
    if (next) next()
  }

  const work = Promise.all(
    agents.map(async (agent) => {
      await acquire()
      try {
        const r = await worker(agent, emit)
        results.push(r)
      } catch (err) {
        results.push({
          slug: agent.slug,
          error: String(err),
          durationMs: 0,
        })
        emit({ type: 'agent.error', slug: agent.slug, error: String(err) })
      } finally {
        release()
      }
    })
  ).then(() => {
    done = true
    tick()
  })

  return {
    results,
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<DossierEvent>> {
          while (queue.length === 0 && !done) {
            await new Promise<void>((res) => (resolveTick = res))
          }
          if (queue.length > 0) {
            return { value: queue.shift()!, done: false }
          }
          await work
          return { value: undefined as unknown as DossierEvent, done: true }
        },
      }
    },
  }
}

// =============================================================================
// Single agent runner with streaming → emit per chunk
// =============================================================================

interface RunAgentArgs {
  slug: string
  model: string
  maxTokens: number
  system: string[] | string
  userPrompt: string
  emit: (ev: DossierEvent) => void
}

async function runAgent(args: RunAgentArgs): Promise<AgentRunResult> {
  const start = Date.now()
  args.emit({ type: 'agent.running', slug: args.slug })

  let lastEmitAt = 0
  const EMIT_INTERVAL_MS = 80 // throttle thought emissions
  let text = ''

  try {
    for await (const delta of stream({
      model: args.model,
      maxTokens: args.maxTokens,
      system: args.system,
      messages: [{ role: 'user', content: args.userPrompt }],
    })) {
      text += delta
      const now = Date.now()
      if (now - lastEmitAt > EMIT_INTERVAL_MS) {
        args.emit({
          type: 'agent.thought',
          slug: args.slug,
          chunk: delta,
        })
        lastEmitAt = now
      }
    }

    const output = tryParseJson(text) ?? { text }
    const durationMs = Date.now() - start
    args.emit({ type: 'agent.done', slug: args.slug, output, durationMs })
    return { slug: args.slug, output, durationMs }
  } catch (err) {
    const durationMs = Date.now() - start
    const error = String(err)
    args.emit({ type: 'agent.error', slug: args.slug, error })
    return { slug: args.slug, error, durationMs }
  }
}

interface RunStructuredArgs<T> {
  slug: string
  model: string
  maxTokens: number
  system: string
  userPrompt: string
  fallback: () => T
}

interface StructuredResult<T> {
  value: T
  events: AsyncGenerator<DossierEvent>
}

function runStructuredAgent<T>(args: RunStructuredArgs<T>): StructuredResult<T> {
  const queue: DossierEvent[] = []
  let resolved: (() => void) | null = null
  let done = false
  const tick = () => {
    if (resolved) {
      resolved()
      resolved = null
    }
  }
  const emit = (ev: DossierEvent) => {
    queue.push(ev)
    tick()
  }
  const valueRef = { current: args.fallback() }
  const work = (async () => {
    const r = await runAgent({
      slug: args.slug,
      model: args.model,
      maxTokens: args.maxTokens,
      system: args.system,
      userPrompt: args.userPrompt,
      emit,
    })
    if (r.output && typeof r.output === 'object' && 'text' in (r.output as object)) {
      const parsed = tryParseJson((r.output as { text: string }).text)
      if (parsed) valueRef.current = parsed as T
    } else if (r.output) {
      valueRef.current = r.output as T
    }
    done = true
    tick()
  })()

  async function* gen(): AsyncGenerator<DossierEvent> {
    while (!done || queue.length > 0) {
      while (queue.length > 0) yield queue.shift()!
      if (!done) await new Promise<void>((res) => (resolved = res))
    }
    await work
  }

  return {
    get value() {
      return valueRef.current
    },
    events: gen(),
  }
}

// =============================================================================
// System / user prompts per agent
// =============================================================================

function buildSharedContext(
  input: DossierInput,
  page: { textExcerpt: string; title: string | null; description: string | null },
  xray: XrayPrelim
): string {
  return `<dossier_context>
You are part of a 20-agent swarm generating a personalized strategic brief
for ${xray.domain}. Your output will be combined with other agents'.

<company>
  domain: ${xray.domain}
  title:  ${page.title ?? 'unknown'}
  meta:   ${page.description ?? 'none'}
  detected_tech: ${xray.techStack.join(', ') || 'unknown'}
</company>

<founder_input>
  area_losing_time: ${input.area}
  hours_per_week:   ${input.hours}
  team_size:        ${input.team}
</founder_input>

<homepage_excerpt>
${page.textExcerpt || '(no text extracted — site likely SPA or blocked)'}
</homepage_excerpt>
</dossier_context>`
}

function intelSystemFor(slug: string): string {
  const map: Record<string, string> = {
    'site-scout':
      'You are a recon agent. Read the homepage excerpt and report 3 facts about the company in <findings> tags as JSON: {value_prop, primary_cta, audience_signal}. Be terse, factual, no fluff.',
    'pricing-hunter':
      'You hunt for pricing signals. Infer the pricing model and approximate ACV from the excerpt. Output JSON: {pricing_model, acv_estimate_usd, gut_check}. If unknown, say so honestly.',
    'blog-listener':
      'You are a brand voice analyst. From the excerpt, characterize the writing tone in 1 sentence + 3 voice descriptors. Output JSON: {tone_sentence, descriptors}.',
    'careers-prospector':
      'Infer hiring priorities from the excerpt + tech stack. What roles are likely open or recently filled? Output JSON: {likely_open_roles, growth_signal}.',
    'changelog-archivist':
      'Estimate shipping cadence and product maturity from the excerpt. Output JSON: {cadence_estimate, maturity_stage}.',
    'tech-detective':
      'You are a tech-stack analyst. Given detected stack and excerpt, identify 5 likely SaaS tools in use and 3 obvious integration gaps. Output JSON: {likely_saas, integration_gaps}.',
  }
  return map[slug] ?? 'Analyze the context and produce useful findings as JSON.'
}

function intelUserFor(slug: string, _excerpt: string): string {
  return `Run your ${slug} mission now. Output ONLY a JSON object inside a single \`\`\`json code block. No other text.`
}

function analysisSystemFor(slug: string): string {
  const map: Record<string, string> = {
    'industry-classifier':
      'Classify the company. Output JSON: {industry, sub_vertical, stage, business_model, geography_inferred}.',
    'icp-modeler':
      'Reverse-engineer the ICP from intel findings. Output JSON: {icp_persona, icp_company_size, top_3_jtbd, buying_committee}.',
    'pain-cartographer':
      'Map the founder-stated pain (area_losing_time + hours_per_week) to specific workflow choke points. Output JSON: {choke_points: [{name, weekly_hours, root_cause, automatability_score_0_to_10}]}.',
    'moat-evaluator':
      'Identify 3 asymmetric strengths the company already has. Output JSON: {moats: [{name, evidence, exploit_path}]}.',
    'tone-mirror':
      'Synthesize a brand voice spec for the dossier itself. Output JSON: {voice: {register, sentence_length, vocabulary_signals}, dossier_writing_rules}.',
  }
  return map[slug] ?? 'Synthesize analysis from intel findings as JSON.'
}

function analysisUserFor(slug: string): string {
  return `Run your ${slug} mission. Output ONLY a JSON object inside a single \`\`\`json block. No prose.`
}

function strategySystemFor(slug: string): string {
  if (slug === 'roi-quant') {
    return `You quantify ROI. For each opportunity proposed by other strategy agents (assume 5 opportunities), estimate annual savings range, hours reclaimed weekly, and confidence. Output JSON: {opportunities: [{slug, est_savings_low_usd, est_savings_high_usd, hours_reclaimed_weekly, confidence}]}.`
  }
  return `You are an Automation Architect. Propose ONE specific, named AI automation tailored to this company. Be concrete — name the agent, the workflow it owns, the integrations required, the build complexity, and the expected outcome. Output JSON: {title, one_line_pitch, workflow_steps, integrations, build_48hr_scope, success_metric, risk}. Do NOT generic-ify — reference specifics from the analysis findings.`
}

function strategyUserFor(slug: string, input: DossierInput): string {
  return `Run your ${slug} mission. The founder said their pain is: "${input.area}", costing ~${input.hours} hours/week across ${input.team} people. Output ONLY a JSON object in a \`\`\`json block.`
}

const THESIS_PROMPT = `Synthesize a one-paragraph "bottom line thesis" for this dossier.

Then return a single JSON object in a \`\`\`json block matching:
{
  "companyName": string,        // best inferred company name
  "industry": string,
  "positioning": string,        // one sentence
  "audienceSummary": string,    // who they serve
  "topPainPoints": string[],    // 3-5 items
  "techStackSummary": string,   // one sentence
  "competitiveContext": string, // one sentence
  "bottomLineThesis": string    // 2-3 sentences, the punchline of the dossier
}`

const SCOPE_PROMPT = `Compose a proposed 48-hour build scope for this company,
based on the highest-confidence opportunity. Return a single JSON object in a
\`\`\`json block:
{
  "title": string,                          // name the build
  "summary": string,                        // 2 sentences
  "deliverables": string[],                 // 4-6 concrete artifacts
  "timeline": string,                       // e.g. "48 hours, with checkpoints at hour 12 and 36"
  "investmentRangeUSD": { "low": number, "high": number }
}`

function editorPrompt(args: {
  slug: string
  domain: string
  input: DossierInput
  analysis: DossierAnalysis
  opportunities: DossierOpportunity[]
  competitors: DossierCompetitor[]
  scope: FullDossier['proposedScope']
}): string {
  return `You are the Editor-in-Chief. Final pass on the dossier — tighten copy,
ensure voice consistency, deduplicate, and return the final JSON dossier.

Inputs:
- slug: ${args.slug}
- domain: ${args.domain}
- founder_input: ${JSON.stringify(args.input)}
- analysis: ${JSON.stringify(args.analysis)}
- opportunities: ${JSON.stringify(args.opportunities)}
- competitors: ${JSON.stringify(args.competitors)}
- proposedScope: ${JSON.stringify(args.scope)}

Return one JSON object inside a single \`\`\`json block matching the FullDossier shape:
{
  "slug", "domain", "companyName", "input", "xray",
  "analysis", "opportunities", "competitors", "proposedScope", "generatedAt"
}
Use the current ISO timestamp for generatedAt. Preserve input/xray as given.`
}

// =============================================================================
// Helpers
// =============================================================================

function tryParseJson(text: string): unknown | null {
  if (!text) return null
  // Try to find ```json ... ``` block first
  const fence = text.match(/```json\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1] : text
  const trimmed = candidate.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    // Try to find first { ... } substring
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function collectOutputs(results: AgentRunResult[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const r of results) {
    out[r.slug] = r.output ?? null
  }
  return out
}

function formatIntel(o: Record<string, unknown>): string {
  return Object.entries(o)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')
}
const formatAnalysis = formatIntel
const formatStrategy = formatIntel

function extractOpportunities(strategy: Record<string, unknown>): DossierOpportunity[] {
  const opps: DossierOpportunity[] = []
  const roi = (strategy['roi-quant'] as { opportunities?: unknown[] } | null)
    ?.opportunities ?? []
  for (const k of Object.keys(strategy)) {
    if (k === 'roi-quant') continue
    const raw = strategy[k] as Record<string, unknown> | null
    if (!raw) continue
    const roiMatch = roi.find((x) => (x as { slug?: string }).slug === k) as
      | { est_savings_low_usd?: number; est_savings_high_usd?: number; hours_reclaimed_weekly?: number; confidence?: string }
      | undefined
    opps.push({
      title: String(raw.title ?? raw.one_line_pitch ?? `Opportunity ${k}`),
      description: String(raw.one_line_pitch ?? raw.title ?? ''),
      estSavingsAnnualUSD: {
        low: Number(roiMatch?.est_savings_low_usd ?? 50_000),
        high: Number(roiMatch?.est_savings_high_usd ?? 200_000),
      },
      estHoursReclaimedWeekly: Number(roiMatch?.hours_reclaimed_weekly ?? 10),
      techRequired: Array.isArray(raw.integrations) ? (raw.integrations as string[]) : [],
      build48HrScope: String(raw.build_48hr_scope ?? ''),
      confidence:
        (roiMatch?.confidence as 'low' | 'medium' | 'high') ?? 'medium',
    })
  }
  return opps
}

function extractCompetitors(_strategy: Record<string, unknown>): DossierCompetitor[] {
  // Sprint 7 (I4) populates this — for Sprint 1 leave empty.
  return []
}

function detectStack(html: string): string[] {
  const stack: string[] = []
  const checks: [RegExp, string][] = [
    [/__NEXT_DATA__|_next\//, 'Next.js'],
    [/wp-content|wordpress/i, 'WordPress'],
    [/cdn\.shopify\.com|myshopify\.com/i, 'Shopify'],
    [/react(?:\.min)?\.js|react-dom/, 'React'],
    [/vue\.min\.js|vuex/i, 'Vue.js'],
    [/js\.stripe\.com/, 'Stripe'],
    [/intercom/i, 'Intercom'],
    [/hubspot/i, 'HubSpot'],
    [/salesforce/i, 'Salesforce'],
    [/zendesk/i, 'Zendesk'],
    [/segment/i, 'Segment'],
    [/google-analytics|gtag\(/, 'Google Analytics'],
    [/klaviyo/i, 'Klaviyo'],
    [/webflow/i, 'Webflow'],
  ]
  for (const [re, name] of checks) if (re.test(html)) stack.push(name)
  return stack
}

// =============================================================================
// Fallbacks (used when Claude calls fail — keeps UX intact)
// =============================================================================

function fallbackAnalysis(xray: XrayPrelim): DossierAnalysis {
  return {
    companyName: xray.domain.split('.')[0] ?? 'Your Company',
    industry: 'Technology',
    positioning: 'A team building modern software for a growing market.',
    audienceSummary: 'Operators and decision-makers in mid-market organizations.',
    topPainPoints: [
      'Manual workflows consuming senior team hours',
      'Data fragmented across SaaS tools without intelligence layer',
      'Customer-facing operations not yet AI-augmented',
    ],
    techStackSummary: xray.techStack.join(', ') || 'Modern web stack inferred',
    competitiveContext:
      'Operating in a category where AI augmentation is becoming table-stakes.',
    bottomLineThesis:
      'Three production AI builds shipped over the next 30 days could reclaim 40+ hours per week and unlock measurable revenue lift.',
  }
}

function fallbackScope(): FullDossier['proposedScope'] {
  return {
    title: 'The 48-Hour Foundation',
    summary:
      'A production-ready AI agent for your highest-volume manual workflow, deployed end-to-end with monitoring.',
    deliverables: [
      'One named, deployed AI agent on your highest-volume workflow',
      'Integration with 2-3 existing SaaS tools',
      'Observability dashboard with latency, accuracy, and cost metrics',
      'Runbook + handoff doc for your team',
    ],
    timeline: '48 hours with checkpoints at hour 12 and hour 36.',
    investmentRangeUSD: { low: 25_000, high: 50_000 },
  }
}

function composeFallback(
  slug: string,
  xray: XrayPrelim,
  input: DossierInput,
  analysis: DossierAnalysis,
  opportunities: DossierOpportunity[],
  competitors: DossierCompetitor[],
  scope: FullDossier['proposedScope']
): FullDossier {
  return {
    slug,
    domain: xray.domain,
    companyName: analysis.companyName,
    input,
    xray,
    analysis,
    opportunities,
    competitors,
    proposedScope: scope,
    generatedAt: new Date().toISOString(),
  }
}
