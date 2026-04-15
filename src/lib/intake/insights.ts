// Client-side insight extraction from conversation messages.
// Extracts key phrases, entities, and categories without API calls.
// Ported from Insinuate repo — pure logic, framework-agnostic.

import type { Insight, InsightCategory } from './types'

const CATEGORY_PATTERNS: { category: InsightCategory; patterns: RegExp[] }[] = [
  {
    category: 'pain_point',
    patterns: [
      /(?:struggle|pain|problem|issue|challenge|frustrat|difficult|slow|manual|tedious|expensive|waste|broken|failing|losing|miss(?:ing)?)\s+(?:with\s+)?(.{3,40})/gi,
      /(?:too much|too many|can'?t|don'?t have|no way to|hard to)\s+(.{3,40})/gi,
      /(?:spend(?:ing)?|waste|wast(?:ing)?)\s+(?:too much\s+)?(?:time|money|effort)\s+(?:on\s+)?(.{3,30})/gi,
    ],
  },
  {
    category: 'goal',
    patterns: [
      /(?:want to|need to|trying to|goal is|hope to|plan to|looking to|wish I could)\s+(.{3,40})/gi,
      /(?:grow|scale|automate|improve|increase|boost|build|launch|create|streamline)\s+(?:my\s+|our\s+|the\s+)?(.{3,30})/gi,
      /(?:more\s+)?(customers?|revenue|sales|leads?|traffic|efficiency|growth)/gi,
    ],
  },
  {
    category: 'tool',
    patterns: [
      /\b(React|Next\.?js|Vue|Angular|Node|Python|Supabase|Firebase|AWS|Vercel|Shopify|WordPress|Stripe|Zapier|n8n|Notion|Airtable|Slack|Discord|Figma|GitHub|Docker|Kubernetes|PostgreSQL|MongoDB|Redis|GraphQL|REST|API|CRM|ERP|Salesforce|HubSpot|Mailchimp|Twilio|SendGrid|OpenAI|GPT|Claude|Anthropic|LangChain)\b/gi,
    ],
  },
  {
    category: 'audience',
    patterns: [
      /(?:target|serve|help|for|audience is|customers are|clients are|users are)\s+(.{3,35})/gi,
      /\b(small business(?:es)?|enterprise|startup|consumer|b2b|b2c|local|global|online|retail|wholesale)\b/gi,
      /\b(homeowners?|students?|teachers?|doctors?|patients?|artists?|musicians?|developers?|designers?|marketers?|founders?|entrepreneurs?|freelancers?|agencies?|teams?|families|parents?|seniors?|millennials?|gen[\s-]?z)\b/gi,
    ],
  },
  {
    category: 'industry',
    patterns: [
      /\b(real estate|healthcare|education|finance|fintech|e-?commerce|retail|restaurant|food|hospitality|fitness|wellness|music|entertainment|media|marketing|advertising|legal|insurance|construction|manufacturing|logistics|transportation|agriculture|energy|solar|renewable|saas|software|technology|consulting|coaching)\b/gi,
    ],
  },
  {
    category: 'workflow',
    patterns: [
      /(?:currently|right now|process|workflow|pipeline|system|step)\s+(.{3,40})/gi,
      /\b(intake|onboarding|follow[\s-]?up|scheduling|booking|billing|invoicing|reporting|tracking|monitoring|analytics|dashboard|notification|email|sms|chat|support|ticketing)\b/gi,
    ],
  },
]

export const CATEGORY_LABELS: Record<InsightCategory, string> = {
  pain_point: 'Pain Points',
  goal: 'Goals',
  tool: 'Tech Stack',
  audience: 'Audience',
  industry: 'Industry',
  workflow: 'Workflows',
}

export const CATEGORY_ICONS: Record<InsightCategory, string> = {
  pain_point: '\u26A1',
  goal: '\u25CE',
  tool: '\u2B21',
  audience: '\u25C8',
  industry: '\u25C7',
  workflow: '\u21BB',
}

function cleanInsight(text: string): string {
  return text
    .replace(/[.,;:!?]+$/, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^(my|our|the|a|an)\s+/i, '')
    .trim()
}

export function extractInsights(
  messages: { role: string; content: string }[]
): Insight[] {
  const seen = new Set<string>()
  const insights: Insight[] = []

  messages.forEach((msg, msgIndex) => {
    if (msg.role !== 'user') return
    const text = msg.content

    for (const { category, patterns } of CATEGORY_PATTERNS) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0
        let match
        while ((match = pattern.exec(text)) !== null) {
          const raw = match[1] || match[0]
          const cleaned = cleanInsight(raw)

          if (cleaned.length < 3 || cleaned.length > 40) continue
          if (
            /^(the|and|but|for|with|that|this|from|have|been|will|just|like|some|more|very|also)$/i.test(
              cleaned
            )
          )
            continue

          const key = `${category}:${cleaned}`
          if (seen.has(key)) continue
          seen.add(key)

          insights.push({
            text: cleaned,
            category,
            confidence:
              category === 'tool' || category === 'industry' ? 0.95 : 0.7,
            sourceIndex: msgIndex,
          })
        }
      }
    }
  })

  return insights.sort(
    (a, b) => b.confidence - a.confidence || a.sourceIndex - b.sourceIndex
  )
}

export function generateContextualChips(
  messages: { role: string; content: string }[],
  insights: Insight[]
): string[] {
  const userMsgCount = messages.filter((m) => m.role === 'user').length
  if (userMsgCount === 0) return []

  const chips: string[] = []

  if (userMsgCount === 1) {
    if (!insights.some((i) => i.category === 'pain_point')) {
      chips.push('The biggest friction is...')
    }
    if (!insights.some((i) => i.category === 'goal')) {
      chips.push("Ideally, I'd want to...")
    }
    chips.push('We currently handle this manually')
    chips.push("It's costing us time and money")
  } else if (userMsgCount === 2) {
    if (!insights.some((i) => i.category === 'tool')) {
      chips.push('We use spreadsheets mostly')
      chips.push('No real tech stack yet')
    }
    if (!insights.some((i) => i.category === 'workflow')) {
      chips.push('Everything is done by hand')
    }
    chips.push("We've tried a few tools but nothing sticks")
  } else if (userMsgCount >= 3) {
    if (!insights.some((i) => i.category === 'audience')) {
      chips.push('Mostly local customers')
      chips.push('Other businesses like mine')
    }
    chips.push('They find us through word of mouth')
    chips.push('We want to reach more people online')
  }

  return chips.slice(0, 4)
}
