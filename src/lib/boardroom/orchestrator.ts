import { stream, complete, MODELS, extractJson } from '../llm'
import { getDossierBySlug } from '../dossier/persist'
import { PERSONAS } from './personas'
import type { BoardRoomEvent, BoardRoomInput, ExecPersona, ExecRole, Vote } from './types'

/**
 * AI Board Room orchestrator.
 *
 * Phase 1 (opening)  — all 4 execs stream simultaneously, each giving their
 *                      opening take on the topic (Sonnet, parallel).
 * Phase 2 (debate)   — each exec reads the others' openings, responds to the
 *                      strongest disagreement (Sonnet, sequential so they can
 *                      react).
 * Phase 3 (vote)     — one Opus call with all transcripts, returns structured
 *                      JSON vote tally + declared winner.
 */
export async function* runBoardRoom(input: BoardRoomInput): AsyncGenerator<BoardRoomEvent> {
  yield { type: 'started', topic: input.topic }

  const sharedContext = await buildSharedContext(input)

  // ---- Phase 1: Opening takes (parallel) -----------------------------------
  yield { type: 'phase', phase: 'opening' }
  const openings: Record<ExecRole, string> = { cfo: '', cmo: '', cto: '', coo: '' }
  const queue: BoardRoomEvent[] = []
  const tickRef: { current: (() => void) | null } = { current: null }
  const tick = () => {
    if (tickRef.current) {
      tickRef.current()
      tickRef.current = null
    }
  }
  const emit = (ev: BoardRoomEvent) => {
    queue.push(ev)
    tick()
  }
  let openingDone = false

  const openingWork = Promise.all(
    PERSONAS.map(async (p) => {
      emit({ type: 'exec.thinking', role: p.role })
      try {
        const text = await streamExec({
          persona: p,
          sharedContext,
          userPrompt: openingPrompt(input),
          emit,
        })
        openings[p.role] = text
        emit({ type: 'exec.done', role: p.role, text })
      } catch (err) {
        emit({ type: 'exec.error', role: p.role, error: String(err) })
      }
    })
  ).then(() => {
    openingDone = true
    tick()
  })

  while (!openingDone || queue.length > 0) {
    while (queue.length > 0) yield queue.shift()!
    if (!openingDone) await new Promise<void>((res) => (tickRef.current = res))
  }
  await openingWork

  // ---- Phase 2: Debate (sequential — each exec reacts to the others) -------
  yield { type: 'phase', phase: 'debate' }
  const rebuttals: Record<ExecRole, string> = { cfo: '', cmo: '', cto: '', coo: '' }
  for (const p of PERSONAS) {
    const othersBlock = PERSONAS.filter((q) => q.role !== p.role)
      .map((q) => `<${q.role}_opening>\n${openings[q.role]}\n</${q.role}_opening>`)
      .join('\n\n')
    const pushQueue: BoardRoomEvent[] = []
    const resolveRef: { current: (() => void) | null } = { current: null }
    let done = false
    const tickP = () => {
      if (resolveRef.current) {
        resolveRef.current()
        resolveRef.current = null
      }
    }
    const push = (ev: BoardRoomEvent) => {
      pushQueue.push(ev)
      tickP()
    }
    push({ type: 'exec.thinking', role: p.role })
    const work = (async () => {
      try {
        const text = await streamExec({
          persona: p,
          sharedContext,
          userPrompt: debatePrompt(othersBlock),
          emit: push,
        })
        rebuttals[p.role] = text
        push({ type: 'exec.done', role: p.role, text })
      } catch (err) {
        push({ type: 'exec.error', role: p.role, error: String(err) })
      }
      done = true
      tickP()
    })()
    while (!done || pushQueue.length > 0) {
      while (pushQueue.length > 0) yield pushQueue.shift()!
      if (!done) await new Promise<void>((res) => (resolveRef.current = res))
    }
    await work
  }

  // ---- Phase 3: Vote (single Opus call, structured JSON) -------------------
  yield { type: 'phase', phase: 'vote' }
  const transcript = buildTranscript(openings, rebuttals)
  const voteResult = await callVote(sharedContext, transcript)
  yield { type: 'vote', votes: voteResult.votes, winner: voteResult.winner }

  yield { type: 'complete' }
}

// =============================================================================
// Shared context — pull dossier if provided, else use freeform topic
// =============================================================================

async function buildSharedContext(input: BoardRoomInput): Promise<string> {
  let dossierBlock = ''
  if (input.dossierSlug) {
    const d = await getDossierBySlug(input.dossierSlug)
    if (d) {
      dossierBlock = `<dossier>
  company: ${d.companyName}
  domain: ${d.domain}
  industry: ${d.analysis.industry}
  positioning: ${d.analysis.positioning}
  top_pain_points: ${JSON.stringify(d.analysis.topPainPoints)}
  opportunities: ${JSON.stringify(
    d.opportunities.map((o) => ({
      title: o.title,
      savings: o.estSavingsAnnualUSD,
      confidence: o.confidence,
    }))
  )}
  proposed_scope: ${JSON.stringify(d.proposedScope)}
</dossier>`
    }
  }
  return `<board_room_context>
You sit on Insinuate.ai's Board Room — an advisory council of four senior
operators who debate a real company's automation strategy in front of their
founder. Output is voice-first prose, no markdown headers, ≤140 words per turn.

<topic>
${input.topic}
</topic>

${input.context ? `<founder_note>\n${input.context}\n</founder_note>` : ''}

${dossierBlock}
</board_room_context>`
}

// =============================================================================
// Stream a single exec — shared streaming helper
// =============================================================================

interface StreamExecArgs {
  persona: ExecPersona
  sharedContext: string
  userPrompt: string
  emit: (ev: BoardRoomEvent) => void
}

async function streamExec(args: StreamExecArgs): Promise<string> {
  let buffer = ''
  let lastEmit = 0
  const INTERVAL_MS = 60

  for await (const delta of stream({
    model: MODELS.sonnet(),
    maxTokens: 500,
    system: [args.sharedContext, args.persona.systemPrompt],
    messages: [{ role: 'user', content: args.userPrompt }],
  })) {
    buffer += delta
    const now = Date.now()
    if (now - lastEmit > INTERVAL_MS) {
      args.emit({ type: 'exec.chunk', role: args.persona.role, chunk: delta })
      lastEmit = now
    }
  }
  return buffer
}

// =============================================================================
// Prompts
// =============================================================================

function openingPrompt(input: BoardRoomInput): string {
  return `Give your opening take (≤140 words) on the topic. Do not summarize
the dossier — advance a position. End with one concrete recommendation wrapped
in <rec>…</rec> tags.

Topic: ${input.topic}`
}

function debatePrompt(othersBlock: string): string {
  return `Your fellow execs opened with:

${othersBlock}

Now respond. Pick the opening you most disagree with and pressure-test it by
name. Sharpen or change your own recommendation in light of their points.
Still ≤140 words, still end with <rec>…</rec>.`
}

function buildTranscript(
  openings: Record<ExecRole, string>,
  rebuttals: Record<ExecRole, string>
): string {
  return PERSONAS.map(
    (p) => `<${p.role}>
Opening: ${openings[p.role]}

Rebuttal: ${rebuttals[p.role]}
</${p.role}>`
  ).join('\n\n')
}

// =============================================================================
// Vote tally — single Opus call with structured output
// =============================================================================

async function callVote(
  sharedContext: string,
  transcript: string
): Promise<{ votes: Vote[]; winner: string }> {
  const text = await complete({
    model: MODELS.opus(),
    maxTokens: 1200,
    system: [
      sharedContext,
      `You are the Board Room scribe. Given the full transcript
from 4 execs (CFO, CMO, CTO, COO), extract each exec's final recommendation
and confidence, then declare the single winning recommendation (either
consensus or the strongest dissenting vote if tied). Output ONLY JSON in a
\`\`\`json block:

{
  "votes": [
    { "role": "cfo"|"cmo"|"cto"|"coo",
      "recommendation": string,
      "confidence": "low"|"medium"|"high",
      "rationale": string }
  ],
  "winner": string
}`,
    ],
    messages: [{ role: 'user', content: transcript }],
  })
  return parseVote(text)
}

function parseVote(text: string): { votes: Vote[]; winner: string } {
  const parsed = extractJson<{ votes: Vote[]; winner: string }>(text)
  if (parsed && Array.isArray(parsed.votes) && typeof parsed.winner === 'string') {
    return parsed
  }
  return {
    votes: [],
    winner: 'The board deadlocked — founder tiebreaker required.',
  }
}
