export interface LineItem {
  id: string
  label: string
  description: string
  priceCents: number
  defaultQty: number
  maxQty: number
  category: 'core' | 'automation' | 'data' | 'ux' | 'residency'
  timelineDays: number
}

export const CATALOG: LineItem[] = [
  {
    id: 'poc48',
    label: '48-Hour Proof of Concept',
    description:
      'One production AI workflow, shipped to your infra, full source code + live dashboard.',
    priceCents: 25_000_00,
    defaultQty: 1,
    maxQty: 1,
    category: 'core',
    timelineDays: 2,
  },
  {
    id: 'residency5',
    label: '1-Week AI Residency',
    description:
      'Embedded for 5 working days — 3 to 5 automations shipped + team training.',
    priceCents: 75_000_00,
    defaultQty: 0,
    maxQty: 1,
    category: 'residency',
    timelineDays: 7,
  },
  {
    id: 'invoice_pipeline',
    label: 'Invoice / Document Extraction Pipeline',
    description:
      'Claude-powered extraction from email/PDF, push into ERP or Supabase. Cuts 20–40h/week of AP work.',
    priceCents: 12_000_00,
    defaultQty: 0,
    maxQty: 3,
    category: 'automation',
    timelineDays: 3,
  },
  {
    id: 'support_triage',
    label: 'Support Ticket Triage + Drafted Replies',
    description:
      'Routes incoming tickets, drafts cited replies, posts to Intercom/Zendesk. Deflects 30–50% of L1.',
    priceCents: 14_000_00,
    defaultQty: 0,
    maxQty: 2,
    category: 'automation',
    timelineDays: 3,
  },
  {
    id: 'lead_scoring',
    label: 'Lead Scoring + Outreach Drafting',
    description:
      'ICP scoring + personalized first-touch drafts, synced to your CRM for one-click send.',
    priceCents: 10_000_00,
    defaultQty: 0,
    maxQty: 2,
    category: 'automation',
    timelineDays: 2,
  },
  {
    id: 'competitor_radar',
    label: 'Competitor Radar',
    description:
      'Daily scrape of competitor pricing, changelogs, press — delivered to Slack/Email as a digest.',
    priceCents: 8_000_00,
    defaultQty: 0,
    maxQty: 1,
    category: 'data',
    timelineDays: 2,
  },
  {
    id: 'exec_dashboard',
    label: 'Executive Dashboard from Unstructured Data',
    description:
      'Pulls from email, PDFs, calls, spreadsheets — synthesizes into a weekly exec one-pager.',
    priceCents: 18_000_00,
    defaultQty: 0,
    maxQty: 1,
    category: 'data',
    timelineDays: 4,
  },
  {
    id: 'internal_app',
    label: 'Custom Internal App',
    description:
      'Bespoke Next.js/Supabase app for one specific workflow — designed, built, deployed.',
    priceCents: 22_000_00,
    defaultQty: 0,
    maxQty: 2,
    category: 'ux',
    timelineDays: 4,
  },
]

export type IcpPreset = 'saas' | 'services' | 'ecommerce' | 'enterprise'

export const ICP_PRESETS: Record<
  IcpPreset,
  { label: string; items: { id: string; qty: number }[] }
> = {
  saas: {
    label: 'SaaS / Fintech',
    items: [
      { id: 'poc48', qty: 1 },
      { id: 'support_triage', qty: 1 },
      { id: 'lead_scoring', qty: 1 },
    ],
  },
  services: {
    label: 'Services / Agency',
    items: [
      { id: 'poc48', qty: 1 },
      { id: 'invoice_pipeline', qty: 1 },
      { id: 'exec_dashboard', qty: 1 },
    ],
  },
  ecommerce: {
    label: 'Ecommerce / DTC',
    items: [
      { id: 'poc48', qty: 1 },
      { id: 'competitor_radar', qty: 1 },
      { id: 'internal_app', qty: 1 },
    ],
  },
  enterprise: {
    label: 'Enterprise',
    items: [
      { id: 'residency5', qty: 1 },
      { id: 'invoice_pipeline', qty: 2 },
      { id: 'support_triage', qty: 1 },
    ],
  },
}

export interface ScopeLine {
  id: string
  qty: number
}

export function priceScope(lines: ScopeLine[]): {
  subtotalCents: number
  totalCents: number
  timelineDays: number
  items: { line: LineItem; qty: number; subtotalCents: number }[]
} {
  const items = lines
    .map((l) => {
      const line = CATALOG.find((c) => c.id === l.id)
      if (!line || l.qty < 1) return null
      const clamped = Math.min(l.qty, line.maxQty)
      return { line, qty: clamped, subtotalCents: line.priceCents * clamped }
    })
    .filter((x): x is { line: LineItem; qty: number; subtotalCents: number } => !!x)

  const subtotalCents = items.reduce((s, i) => s + i.subtotalCents, 0)
  // No discount for v1 — pricing is honest and public.
  const totalCents = subtotalCents
  const timelineDays = items.reduce(
    (max, i) => Math.max(max, i.line.timelineDays),
    0
  )
  return { subtotalCents, totalCents, timelineDays, items }
}
