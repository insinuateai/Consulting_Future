import type Anthropic from '@anthropic-ai/sdk'

export const CALENDLY_URL = 'https://calendly.com/kianjquinlan/30min'

export const CONCIERGE_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'book_call',
    description:
      'Offer the Calendly booking link. Use when the user has indicated intent to talk to a human, schedule a call, or signed off on the sales conversation.',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Short reason the user wants to book — for analytics.',
        },
      },
      required: [],
    },
  },
  {
    name: 'send_dossier',
    description:
      'Trigger a personalized strategic dossier for the user\'s company. Only call when you have the user\'s email AND a domain or company URL to analyze.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email address' },
        domain: {
          type: 'string',
          description: 'Company domain or URL to analyze (e.g., acme.com)',
        },
      },
      required: ['email', 'domain'],
    },
  },
  {
    name: 'lookup_case_study',
    description:
      'Return a concise summary of a past Insinuate build matching the topic. Use when the user asks about specific past work, outcomes, or wants proof.',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic / automation area the user is asking about.',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'estimate_price',
    description:
      'Return a rough price range for an engagement based on the scope described.',
    input_schema: {
      type: 'object',
      properties: {
        scope_summary: {
          type: 'string',
          description: 'One-line summary of what the user wants built.',
        },
        complexity: {
          type: 'string',
          enum: ['simple', 'standard', 'deep', 'enterprise'],
        },
      },
      required: ['scope_summary', 'complexity'],
    },
  },
]

/**
 * Tool implementations — pure functions, return strings for Claude to
 * weave into its next turn. Side effects (email send, DB writes) happen
 * in the route handler so they're observable + rate-limited.
 */
export function runTool(
  name: string,
  args: Record<string, unknown>
): { result: string; sideEffect?: { type: string; data: Record<string, unknown> } } {
  switch (name) {
    case 'book_call':
      return {
        result: `Booking link: ${CALENDLY_URL}. 30 minutes with Kian.`,
        sideEffect: { type: 'book_call', data: args },
      }
    case 'send_dossier': {
      const email = String(args.email ?? '')
      const domain = String(args.domain ?? '')
      return {
        result: `Dossier queued for ${domain}. Will arrive at ${email} in about 90 seconds.`,
        sideEffect: { type: 'send_dossier', data: { email, domain } },
      }
    }
    case 'lookup_case_study': {
      const topic = String(args.topic ?? '').toLowerCase()
      const match = CASE_STUDIES.find((c) =>
        c.tags.some((t) => topic.includes(t))
      )
      if (!match) {
        return {
          result:
            'No exact match in the library. Ask Kian directly — he usually has a close analog.',
        }
      }
      return {
        result: `${match.name} (${match.industry}): ${match.summary} — Shipped in ${match.timeline}. ROI: ${match.roi}.`,
      }
    }
    case 'estimate_price': {
      const complexity = String(args.complexity ?? 'standard')
      const price = PRICE_BANDS[complexity] ?? PRICE_BANDS.standard
      return {
        result: `${price.range} — ${price.offer}. Self-serve at /scope if it fits a standard band.`,
      }
    }
    default:
      return { result: `Unknown tool: ${name}` }
  }
}

const PRICE_BANDS: Record<string, { range: string; offer: string }> = {
  simple: {
    range: '$5K–$15K',
    offer: 'One-off automation, shipped in 48 hours',
  },
  standard: {
    range: '$25K',
    offer: '48-Hour Proof of Concept — fixed price',
  },
  deep: {
    range: '$75K',
    offer: '1-Week AI Residency — embedded team, 3–5 automations',
  },
  enterprise: {
    range: '$15K–$40K / mo',
    offer: 'Ongoing Scale retainer — requires a call',
  },
}

const CASE_STUDIES = [
  {
    name: 'Midwest HVAC distributor',
    industry: 'wholesale / services',
    tags: ['invoice', 'extraction', 'erp', 'document', 'accounts payable'],
    summary:
      'Invoice extraction + NetSuite sync replaced 40h/week of AP work with a Claude pipeline.',
    timeline: '48 hours',
    roi: '~$52K/yr labor + 4-day faster payables cycle',
  },
  {
    name: 'SaaS fintech series-A',
    industry: 'saas / fintech',
    tags: ['support', 'ticket', 'triage', 'customer', 'help'],
    summary:
      'Intercom ticket triage + drafted replies with citations deflected 38% of L1 tickets.',
    timeline: '48 hours',
    roi: 'Saved 2 FTE, lifted CSAT by 11 points',
  },
  {
    name: 'B2B analytics platform',
    industry: 'saas',
    tags: ['lead', 'scoring', 'sales', 'bdr', 'outreach', 'crm'],
    summary:
      'Lead scoring + personalized outreach drafts shipped into HubSpot. BDR team moved from copy-paste to approve-and-send.',
    timeline: '1-week residency',
    roi: '2.4x reply rate, 20h/week saved',
  },
  {
    name: 'DTC cosmetics brand',
    industry: 'ecommerce',
    tags: ['shopify', 'sku', 'margin', 'inventory', 'dashboard'],
    summary:
      'Internal dashboard pulling Shopify + Shippo + raw costs to show true SKU margin daily.',
    timeline: '48 hours',
    roi: 'Pulled 2 low-margin SKUs, reallocated ad spend — +$18K/mo',
  },
]
