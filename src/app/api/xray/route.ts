import { NextRequest, NextResponse } from 'next/server'

export interface XRayData {
  techStack: string[]
  score: number
  savingsEstimate: number
  workflows: string[]
  domain: string
}

// Tech detection patterns
const TECH_PATTERNS: [RegExp, string][] = [
  [/wp-content|wp-json|wordpress/i,           'WordPress'],
  [/cdn\.shopify\.com|myshopify\.com/i,       'Shopify'],
  [/__NEXT_DATA__|_next\//,                   'Next.js'],
  [/vue\.min\.js|vuex|vue\.runtime/i,         'Vue.js'],
  [/angular(?:\.min)?\.js|ng-app/i,           'Angular'],
  [/js\.stripe\.com/,                         'Stripe'],
  [/intercom/i,                               'Intercom'],
  [/hs-scripts\.hubspot\.com|hubspot/i,       'HubSpot'],
  [/salesforce/i,                             'Salesforce'],
  [/zendesk/i,                                'Zendesk'],
  [/gtag\(|google-analytics\.com/,           'Google Analytics'],
  [/klaviyo/i,                               'Klaviyo'],
  [/segment\.com\/analytics|analytics\.js/,  'Segment'],
  [/webflow\.com\/css|webflow\.io/i,         'Webflow'],
  [/react(?:\.min)?\.js|react-dom/,          'React'],
  [/typekit\.net|use\.typekit/,              'Adobe Fonts'],
  [/cdn\.amplitude\.com|amplitude/i,         'Amplitude'],
  [/mixpanel/i,                              'Mixpanel'],
]

// Opportunity map keyed by detected tool
const OPPORTUNITY_MAP: Record<string, string> = {
  'HubSpot':          'Lead scoring → Predictive qualification model',
  'Salesforce':       'CRM data enrichment → Automated AI summaries',
  'Zendesk':          'Customer inquiry routing → AI triage agent',
  'Intercom':         'Support chat → AI deflection + instant resolution',
  'Shopify':          'Order support queries → Automated resolution bot',
  'WordPress':        'Content publishing → AI-assisted SEO drafting',
  'Google Analytics': 'Conversion data → Predictive funnel optimization',
  'Klaviyo':          'Email sequences → AI-personalized send-time + copy',
  'Segment':          'Event data → Behavioral AI segmentation engine',
  'Amplitude':        'Product analytics → AI-driven feature prioritization',
  'Mixpanel':         'Funnel analytics → Automated churn prediction',
  'Stripe':           'Payment events → Revenue forecasting agent',
  'Next.js':          'Web infrastructure → AI-powered personalization layer',
  'React':            'Frontend → AI component generation + A/B testing',
  'Webflow':          'CMS → AI-generated landing page variants',
}

const GENERIC_WORKFLOWS = [
  'Customer inquiry routing → AI triage agent',
  'Invoice data extraction → Automated pipeline',
  'Lead scoring → Predictive ML model',
  'Report generation → Scheduled AI drafts',
]

const FALLBACK: Omit<XRayData, 'domain'> = {
  techStack:       ['React', 'AWS', 'PostgreSQL', 'Stripe'],
  score:           41,
  savingsEstimate: 247_000,
  workflows:       GENERIC_WORKFLOWS,
}

function buildResult(html: string, domain: string): XRayData {
  // Detect tech stack
  const techStack: string[] = []
  for (const [pattern, name] of TECH_PATTERNS) {
    if (pattern.test(html) && !techStack.includes(name)) {
      techStack.push(name)
    }
  }

  // Score calculation
  let score = 38
  if (techStack.includes('WordPress') || techStack.includes('Webflow')) score += 14
  if (techStack.includes('Shopify'))    score += 8
  if (techStack.includes('Salesforce')) score += 7
  if (techStack.includes('HubSpot'))    score += 7
  if (techStack.includes('Zendesk'))    score += 7
  if (techStack.includes('Intercom'))   score += 7
  if (techStack.includes('Klaviyo'))    score += 5
  if (techStack.includes('Segment'))    score += 5
  if (techStack.includes('Amplitude'))  score += 4
  if (techStack.includes('Mixpanel'))   score += 4
  if (techStack.includes('Google Analytics')) score += 3
  if (techStack.includes('Next.js'))    score -= 5
  score = Math.min(78, Math.max(25, score))

  // Workflows — pick from opportunity map for detected tools, pad with generics
  const workflows: string[] = []
  for (const tool of techStack) {
    if (OPPORTUNITY_MAP[tool] && workflows.length < 4) {
      workflows.push(OPPORTUNITY_MAP[tool])
    }
  }
  for (const g of GENERIC_WORKFLOWS) {
    if (workflows.length >= 4) break
    if (!workflows.includes(g)) workflows.push(g)
  }

  // Savings estimate
  const savingsEstimate = Math.min(600_000, 120_000 + techStack.length * 28_000)

  return {
    techStack:  techStack.length > 0 ? techStack : FALLBACK.techStack,
    score,
    savingsEstimate,
    workflows:  workflows.length > 0 ? workflows : FALLBACK.workflows,
    domain,
  }
}

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json()
    url = body?.url as string
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let domain = ''
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeout)

    const html = await response.text()
    return NextResponse.json(buildResult(html, domain))
  } catch {
    // Network error, timeout, 403, etc. — return clean fallback
    return NextResponse.json({ ...FALLBACK, domain })
  }
}
