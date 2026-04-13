export type Q1Option =
  | 'Customer Support'
  | 'Data Processing'
  | 'Sales & Lead Gen'
  | 'Content & Marketing'
  | 'Internal Operations'

export type Q2Option = '< 10 hours' | '10-30 hours' | '30-80 hours' | '80+ hours'
export type Q3Option = 'Just me' | '2-10 people' | '11-50 people' | '50+ people'

export interface ArchitectureLayer {
  label: string
  items: string[]
}

export interface BlueprintConfig {
  sources: ArchitectureLayer
  processing: ArchitectureLayer
  output: ArchitectureLayer
  supporting: string[]
  baseSavings: number      // USD
  baseBuildHours: [number, number]  // [min, max]
  baseAutomationRate: [number, number] // [min%, max%]
}

export const blueprintConfigs: Record<Q1Option, BlueprintConfig> = {
  'Customer Support': {
    sources: {
      label: 'Data Sources',
      items: ['Tickets', 'Emails', 'Live Chat', 'Knowledge Base'],
    },
    processing: {
      label: 'AI Processing Layer',
      items: ['Triage Agent', 'Resolution Agent', 'Escalation Router'],
    },
    output: {
      label: 'Output Layer',
      items: ['Auto-Responses', 'Case Summaries', 'Analytics Dashboard'],
    },
    supporting: ['Vector DB (RAG)', 'Fine-tuned LLM', 'Human-in-Loop Queue'],
    baseSavings: 100_000,
    baseBuildHours: [32, 48],
    baseAutomationRate: [65, 80],
  },
  'Data Processing': {
    sources: {
      label: 'Data Sources',
      items: ['Invoices', 'PDFs', 'Databases', 'Spreadsheets'],
    },
    processing: {
      label: 'AI Processing Layer',
      items: ['Extraction Agent', 'Validation Agent', 'Reconciliation Engine'],
    },
    output: {
      label: 'Output Layer',
      items: ['Structured Records', 'Audit Trails', 'Error Reports'],
    },
    supporting: ['Document Store', 'Vector Search', 'Workflow Orchestrator'],
    baseSavings: 120_000,
    baseBuildHours: [24, 48],
    baseAutomationRate: [80, 95],
  },
  'Sales & Lead Gen': {
    sources: {
      label: 'Data Sources',
      items: ['CRM', 'LinkedIn', 'Web Scrape', 'Intent Signals'],
    },
    processing: {
      label: 'AI Processing Layer',
      items: ['Enrichment Agent', 'Scoring Agent', 'Outreach Writer'],
    },
    output: {
      label: 'Output Layer',
      items: ['Prioritized Pipeline', 'Personalized Sequences', 'Rep Alerts'],
    },
    supporting: ['Lead Graph DB', 'Email API', 'Slack Integration'],
    baseSavings: 90_000,
    baseBuildHours: [36, 48],
    baseAutomationRate: [60, 75],
  },
  'Content & Marketing': {
    sources: {
      label: 'Data Sources',
      items: ['Brand Guidelines', 'Analytics', 'Competitor Feeds', 'Past Content'],
    },
    processing: {
      label: 'AI Processing Layer',
      items: ['Research Agent', 'Drafting Agent', 'Brand Alignment Checker'],
    },
    output: {
      label: 'Output Layer',
      items: ['Published Posts', 'Content Calendar', 'Performance Reports'],
    },
    supporting: ['Vector Memory Store', 'CMS Connector', 'Approval Queue'],
    baseSavings: 70_000,
    baseBuildHours: [24, 40],
    baseAutomationRate: [55, 70],
  },
  'Internal Operations': {
    sources: {
      label: 'Data Sources',
      items: ['Slack', 'Email', 'Project Tools', 'HR Systems'],
    },
    processing: {
      label: 'AI Processing Layer',
      items: ['Task Router', 'Status Tracker', 'Report Generator'],
    },
    output: {
      label: 'Output Layer',
      items: ['Automated Reports', 'Team Alerts', 'Executive Dashboards'],
    },
    supporting: ['Workflow Engine', 'Notification Bus', 'Auth + Permissions'],
    baseSavings: 80_000,
    baseBuildHours: [28, 48],
    baseAutomationRate: [60, 80],
  },
}

// Multipliers applied to savings estimate
export const q2Multipliers: Record<Q2Option, number> = {
  '< 10 hours':  0.5,
  '10-30 hours': 1.0,
  '30-80 hours': 2.0,
  '80+ hours':   3.5,
}

export const q3Multipliers: Record<Q3Option, number> = {
  'Just me':     0.3,
  '2-10 people': 1.0,
  '11-50 people': 2.5,
  '50+ people':  5.0,
}

export function computeMetrics(
  q1: Q1Option,
  q2: Q2Option,
  q3: Q3Option,
): { savings: string; buildTime: string; automationRate: string } {
  const config = blueprintConfigs[q1]
  const raw = config.baseSavings * q2Multipliers[q2] * q3Multipliers[q3]
  const capped = Math.min(raw, 2_000_000)

  const savingsStr =
    capped >= 1_000_000
      ? `$${(capped / 1_000_000).toFixed(1)}M/year`
      : `$${Math.round(capped / 1_000)}K/year`

  return {
    savings: savingsStr,
    buildTime: `${config.baseBuildHours[0]}-${config.baseBuildHours[1]} hours`,
    automationRate: `${config.baseAutomationRate[0]}-${config.baseAutomationRate[1]}%`,
  }
}
