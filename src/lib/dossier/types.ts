// Shared types for the Dossier feature (Sprint 1).
// The Dossier is a personalized strategic brief generated live by 20+
// parallel Claude subagents — the first viral moment of the site.

export interface DossierInput {
  url: string
  email: string
  area: string // "Where is most time being lost in your business?"
  hours: string // "How many hours a week does your team spend on it?"
  team: string // "How many people are involved?"
}

export interface XrayPrelim {
  domain: string
  techStack: string[]
  industry?: string
  description?: string
  rawHtmlSnippet?: string
}

export type AgentStatus = 'queued' | 'running' | 'success' | 'error'

export interface SwarmAgent {
  slug: string
  name: string
  role: string
  /** What the user sees this agent is doing (e.g. "Reading your pricing page") */
  mission: string
  /** Lane in the grid UI: 'intel' | 'analysis' | 'strategy' | 'output' */
  lane: 'intel' | 'analysis' | 'strategy' | 'output'
  /** Display order within lane */
  order: number
}

export interface SwarmAgentResult {
  slug: string
  status: AgentStatus
  /** Stream of thoughts the agent has emitted so far (typewriter effect) */
  thoughts: string[]
  /** Final structured output JSON */
  output?: unknown
  durationMs?: number
  error?: string
}

export interface DossierAnalysis {
  companyName: string
  industry: string
  positioning: string
  audienceSummary: string
  topPainPoints: string[]
  techStackSummary: string
  competitiveContext: string
  bottomLineThesis: string
}

export interface DossierOpportunity {
  title: string
  description: string
  estSavingsAnnualUSD: { low: number; high: number }
  estHoursReclaimedWeekly: number
  techRequired: string[]
  build48HrScope: string
  confidence: 'low' | 'medium' | 'high'
}

export interface DossierCompetitor {
  name: string
  domain: string
  positioning: string
  pricingHint?: string
  weaknesses: string[]
  opportunityVsThem: string
}

export interface FullDossier {
  slug: string
  domain: string
  companyName: string
  input: DossierInput
  xray: XrayPrelim
  analysis: DossierAnalysis
  opportunities: DossierOpportunity[]
  competitors: DossierCompetitor[]
  proposedScope: {
    title: string
    summary: string
    deliverables: string[]
    timeline: string
    investmentRangeUSD: { low: number; high: number }
  }
  generatedAt: string
}

/** SSE event shape pushed to the live UI during dossier generation. */
export type DossierEvent =
  | { type: 'started'; dossierSlug: string }
  | { type: 'agent.queued'; agent: SwarmAgent }
  | { type: 'agent.running'; slug: string }
  | { type: 'agent.thought'; slug: string; chunk: string }
  | { type: 'agent.done'; slug: string; output?: unknown; durationMs: number }
  | { type: 'agent.error'; slug: string; error: string }
  | { type: 'phase'; phase: 'intel' | 'analysis' | 'strategy' | 'output' }
  | { type: 'complete'; dossier: FullDossier }
  | { type: 'error'; error: string }
