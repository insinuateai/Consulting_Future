export type AgentId = 'invoice' | 'leads' | 'support'

export interface AgentMeta {
  id: AgentId
  name: string
  tagline: string
  buildTime: string
  tech: string[]
}

export const AGENTS: AgentMeta[] = [
  {
    id: 'invoice',
    name: 'Invoice Extraction',
    tagline: 'PDF → structured fields in under a second.',
    buildTime: 'Built in 6h',
    tech: ['GPT-4 Vision', 'AWS Lambda', 'PostgreSQL'],
  },
  {
    id: 'leads',
    name: 'Lead Scoring',
    tagline: 'Enriches, scores, and routes inbound leads.',
    buildTime: 'Built in 9h',
    tech: ['Claude API', 'Clearbit', 'Apollo'],
  },
  {
    id: 'support',
    name: 'Support Agent',
    tagline: 'Resolves tickets with cited knowledge-base answers.',
    buildTime: 'Built in 12h',
    tech: ['Claude API', 'RAG', 'Pinecone'],
  },
]

// ── Invoice fixtures ─────────────────────────────────────────────────────────
export interface InvoiceLineItem {
  description: string
  qty: number
  unit: number
  amount: number
}

export interface InvoiceExtractedField {
  key: string
  label: string
  value: string
  confidence: number
}

export interface InvoiceSample {
  id: string
  vendor: string
  vendorInitial: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  billTo: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  processingTime: string
  extracted: InvoiceExtractedField[]
}

export const INVOICE_SAMPLES: InvoiceSample[] = [
  {
    id: 'northwind',
    vendor: 'Northwind Logistics',
    vendorInitial: 'N',
    invoiceNumber: 'INV-20398',
    issueDate: '2026-03-12',
    dueDate: '2026-04-11',
    billTo: 'Helios Cloud, Inc.',
    lineItems: [
      { description: 'Freight — Bay Area → Reno',  qty: 4, unit: 1_240, amount: 4_960 },
      { description: 'Cross-dock handling',        qty: 12, unit:    85, amount: 1_020 },
      { description: 'Fuel surcharge',             qty:  1, unit:   318, amount:   318 },
    ],
    subtotal: 6_298,
    tax: 503.84,
    total: 6_801.84,
    processingTime: '0.42s',
    extracted: [
      { key: 'vendor',        label: 'Vendor',         value: 'Northwind Logistics', confidence: 99 },
      { key: 'invoiceNumber', label: 'Invoice #',      value: 'INV-20398',           confidence: 99 },
      { key: 'issueDate',     label: 'Issue date',     value: '2026-03-12',          confidence: 98 },
      { key: 'dueDate',       label: 'Due date',       value: '2026-04-11',          confidence: 98 },
      { key: 'total',         label: 'Total',          value: '$6,801.84',           confidence: 99 },
      { key: 'tax',           label: 'Tax',            value: '$503.84',             confidence: 97 },
    ],
  },
  {
    id: 'atlas',
    vendor: 'Atlas Cloud Systems',
    vendorInitial: 'A',
    invoiceNumber: '2026-0447',
    issueDate: '2026-04-01',
    dueDate: '2026-04-30',
    billTo: 'Helios Cloud, Inc.',
    lineItems: [
      { description: 'Compute — c6i.4xlarge (720h)', qty: 720, unit:  0.68, amount:   489.60 },
      { description: 'Egress bandwidth (TB)',        qty:  18, unit: 42.00, amount:   756.00 },
      { description: 'Managed Postgres',             qty:   1, unit: 1_200, amount: 1_200.00 },
    ],
    subtotal: 2_445.60,
    tax: 195.65,
    total: 2_641.25,
    processingTime: '0.38s',
    extracted: [
      { key: 'vendor',        label: 'Vendor',     value: 'Atlas Cloud Systems', confidence: 99 },
      { key: 'invoiceNumber', label: 'Invoice #',  value: '2026-0447',           confidence: 98 },
      { key: 'issueDate',     label: 'Issue date', value: '2026-04-01',          confidence: 99 },
      { key: 'dueDate',       label: 'Due date',   value: '2026-04-30',          confidence: 99 },
      { key: 'total',         label: 'Total',      value: '$2,641.25',           confidence: 99 },
      { key: 'tax',           label: 'Tax',        value: '$195.65',             confidence: 96 },
    ],
  },
  {
    id: 'meridian',
    vendor: 'Meridian Design Co.',
    vendorInitial: 'M',
    invoiceNumber: 'MD-0091',
    issueDate: '2026-03-28',
    dueDate: '2026-04-27',
    billTo: 'Helios Cloud, Inc.',
    lineItems: [
      { description: 'Brand system — Phase 2', qty: 1, unit: 12_500, amount: 12_500 },
      { description: 'Illustration set',        qty: 6, unit:    480, amount:  2_880 },
    ],
    subtotal: 15_380,
    tax: 1_230.40,
    total: 16_610.40,
    processingTime: '0.46s',
    extracted: [
      { key: 'vendor',        label: 'Vendor',     value: 'Meridian Design Co.', confidence: 99 },
      { key: 'invoiceNumber', label: 'Invoice #',  value: 'MD-0091',             confidence: 99 },
      { key: 'issueDate',     label: 'Issue date', value: '2026-03-28',          confidence: 99 },
      { key: 'dueDate',       label: 'Due date',   value: '2026-04-27',          confidence: 98 },
      { key: 'total',         label: 'Total',      value: '$16,610.40',          confidence: 99 },
      { key: 'tax',           label: 'Tax',        value: '$1,230.40',           confidence: 96 },
    ],
  },
]

export const INVOICE_STAGES: { label: string; pct: number; delayMs: number }[] = [
  { label: 'Parsing PDF',      pct:  20, delayMs:    0 },
  { label: 'OCR',              pct:  45, delayMs:  700 },
  { label: 'Field extraction', pct:  75, delayMs: 1500 },
  { label: 'Validation',       pct:  95, delayMs: 2400 },
  { label: 'Done',             pct: 100, delayMs: 3200 },
]

// ── Lead fixtures ────────────────────────────────────────────────────────────
export type LeadBand = 'hot' | 'warm' | 'cold'

export interface LeadSignal {
  label: string
  weight: number
  matched: boolean
}

export interface LeadSample {
  id: string
  company: string
  industry: string
  headcount: string
  revenue: string
  title: string
  recentSignals: string[]
  score: number
  band: LeadBand
  signals: LeadSignal[]
  rationale: string[]
  recommendedAction: string
}

export const LEAD_SAMPLES: LeadSample[] = [
  {
    id: 'contoso',
    company: 'Contoso Analytics',
    industry: 'B2B SaaS · Data Platforms',
    headcount: '420 employees',
    revenue: '$58M ARR',
    title: 'VP of Engineering',
    recentSignals: [
      'Visited /pricing 4x this week',
      'Hiring ML engineers (3 open roles)',
      'Raised Series C 6 weeks ago',
    ],
    score: 92,
    band: 'hot',
    signals: [
      { label: 'ICP fit (industry + size)',   weight: 24, matched: true  },
      { label: 'Buying-stage intent',          weight: 22, matched: true  },
      { label: 'Budget indicators',            weight: 18, matched: true  },
      { label: 'Decision-maker contact',       weight: 16, matched: true  },
      { label: 'Technographic overlap',        weight: 12, matched: true  },
      { label: 'Engagement recency',           weight:  8, matched: true  },
    ],
    rationale: [
      'Decision-maker title with direct budget authority.',
      'Pricing-page activity 4× above cold-lead baseline.',
      'Recent funding round aligns with typical platform-spend window.',
    ],
    recommendedAction: 'Book meeting — high intent, fast follow-up',
  },
  {
    id: 'orbital',
    company: 'Orbital Retail',
    industry: 'E-commerce · Mid-market',
    headcount: '85 employees',
    revenue: '$12M ARR',
    title: 'Head of Operations',
    recentSignals: [
      'Downloaded case study',
      'Opened last 3 emails',
    ],
    score: 64,
    band: 'warm',
    signals: [
      { label: 'ICP fit (industry + size)',   weight: 20, matched: true  },
      { label: 'Buying-stage intent',          weight: 14, matched: true  },
      { label: 'Budget indicators',            weight: 10, matched: false },
      { label: 'Decision-maker contact',       weight: 12, matched: true  },
      { label: 'Technographic overlap',        weight:  8, matched: true  },
      { label: 'Engagement recency',           weight: 10, matched: true  },
    ],
    rationale: [
      'Mid-funnel engagement but no pricing intent yet.',
      'Contact is influencer, not final budget-holder.',
      'Nurture with a tailored ROI teardown before pitching.',
    ],
    recommendedAction: 'Nurture — send ROI teardown, re-score in 14d',
  },
  {
    id: 'lodge',
    company: 'Lodge & Timber Co.',
    industry: 'Consumer · Retail',
    headcount: '12 employees',
    revenue: '$1.8M ARR',
    title: 'Marketing Coordinator',
    recentSignals: [
      'Signed up for newsletter',
    ],
    score: 28,
    band: 'cold',
    signals: [
      { label: 'ICP fit (industry + size)',   weight:  8, matched: false },
      { label: 'Buying-stage intent',          weight:  4, matched: false },
      { label: 'Budget indicators',            weight:  2, matched: false },
      { label: 'Decision-maker contact',       weight:  2, matched: false },
      { label: 'Technographic overlap',        weight:  6, matched: true  },
      { label: 'Engagement recency',           weight:  6, matched: true  },
    ],
    rationale: [
      'Below ICP threshold on both size and revenue.',
      'Contact title has no purchasing authority.',
      'Route to self-serve funnel, not sales.',
    ],
    recommendedAction: 'Disqualify — route to self-serve drip',
  },
]

export const LEAD_STAGES: { label: string; pct: number; delayMs: number }[] = [
  { label: 'Enriching profile',   pct:  20, delayMs:    0 },
  { label: 'Analyzing signals',   pct:  50, delayMs:  700 },
  { label: 'Scoring fit',         pct:  75, delayMs: 1500 },
  { label: 'Scoring intent',      pct:  92, delayMs: 2300 },
  { label: 'Done',                pct: 100, delayMs: 3100 },
]

// ── Support fixtures ─────────────────────────────────────────────────────────
export interface KBArticle {
  id: string
  title: string
  snippet: string
}

export const SUPPORT_KB: KBArticle[] = [
  {
    id: 'kb-billing-proration',
    title: 'Billing · Mid-cycle plan changes',
    snippet: 'How proration works when upgrading or downgrading between billing cycles.',
  },
  {
    id: 'kb-api-rate-limits',
    title: 'API · Rate limits & 429 handling',
    snippet: 'Per-key limits, burst windows, and the recommended backoff strategy.',
  },
  {
    id: 'kb-sso-okta',
    title: 'Security · SSO setup with Okta',
    snippet: 'End-to-end walkthrough: SAML metadata, group claims, JIT provisioning.',
  },
  {
    id: 'kb-data-export',
    title: 'Data · Exporting your workspace',
    snippet: 'Full-fidelity JSON export, retention windows, and encryption at rest.',
  },
  {
    id: 'kb-uptime-sla',
    title: 'Platform · Uptime SLA and status',
    snippet: 'Helios Cloud commits to 99.95% monthly uptime with credits for breach.',
  },
]

export interface SupportPrompt {
  id: string
  prompt: string
  answer: string
  citations: string[]
}

export const SUPPORT_CONVERSATIONS: SupportPrompt[] = [
  {
    id: 'billing',
    prompt: 'How does billing work if I upgrade mid-cycle?',
    answer:
      "When you upgrade mid-cycle, Helios Cloud prorates the difference automatically. You're charged only for the days remaining on the new plan, and any unused time on the old plan is credited back to your next invoice [1]. If you downgrade, the credit is applied on the next renewal rather than refunded immediately. Enterprise plans follow a custom schedule set in your order form.",
    citations: ['kb-billing-proration'],
  },
  {
    id: 'ratelimits',
    prompt: 'I keep getting 429 errors from the API.',
    answer:
      "Sorry about that — 429s mean you've crossed the per-key rate limit. Default keys allow 60 requests/second with a 120-request burst window [1]. The recommended fix is exponential backoff starting at 500ms, plus respecting the `Retry-After` header on every 429 response [1]. If you're regularly saturating the default limit, SSO-scoped keys can be raised on request [2].",
    citations: ['kb-api-rate-limits', 'kb-sso-okta'],
  },
  {
    id: 'sso',
    prompt: 'Can I set up SSO with Okta?',
    answer:
      "Yes — Helios Cloud supports SAML-based SSO with Okta on the Business and Enterprise plans [1]. You'll import our SAML metadata into your Okta app, map group claims to Helios roles, and enable JIT provisioning so new users land in the right workspace on first login [1]. Most teams have it live in under 30 minutes; the full checklist is in the setup guide.",
    citations: ['kb-sso-okta'],
  },
]
