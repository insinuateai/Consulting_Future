import { NextRequest, NextResponse } from 'next/server'
import { complete, MODELS, extractJson } from '@/lib/llm'
import { limits, rateKey } from '@/lib/redis'

export const runtime = 'nodejs'
export const maxDuration = 30

export interface XRayData {
  techStack: string[]
  score: number
  savingsEstimate: number
  workflows: string[]
  domain: string
  analysis?: string
}

// ── Quick regex pre-pass for tech detection (fast, no API cost) ──
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
  [/gtag\(|google-analytics\.com/,            'Google Analytics'],
  [/klaviyo/i,                                'Klaviyo'],
  [/segment\.com\/analytics|analytics\.js/,   'Segment'],
  [/webflow\.com\/css|webflow\.io/i,          'Webflow'],
  [/react(?:\.min)?\.js|react-dom/,           'React'],
  [/typekit\.net|use\.typekit/,               'Adobe Fonts'],
  [/cdn\.amplitude\.com|amplitude/i,          'Amplitude'],
  [/mixpanel/i,                               'Mixpanel'],
  [/supabase/i,                               'Supabase'],
  [/firebase/i,                               'Firebase'],
  [/tailwindcss|tailwind/i,                   'Tailwind CSS'],
  [/googleapis\.com|gstatic\.com/i,           'Google Cloud'],
  [/cloudflare/i,                             'Cloudflare'],
  [/aws|amazonaws\.com/i,                     'AWS'],
  [/vercel/i,                                 'Vercel'],
]

function detectTechStack(html: string): string[] {
  const stack: string[] = []
  for (const [pattern, name] of TECH_PATTERNS) {
    if (pattern.test(html) && !stack.includes(name)) {
      stack.push(name)
    }
  }
  return stack
}

// ── Fallback (used when Claude is unavailable or HTML fetch fails) ──
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

// ── Claude analysis prompt ──
const XRAY_SYSTEM_PROMPT = `You are the Insinuate X-Ray Engine, the most advanced AI business analysis tool on the internet.

You receive a company's raw HTML and a list of detected technologies. Your job: produce a brutally honest, specific, high-value AI readiness analysis in 15 seconds flat.

Return ONLY valid JSON. No markdown, no preamble, no explanation:

{
  "techStack": ["Tool1", "Tool2", ...],
  "score": 42,
  "savingsEstimate": 285000,
  "workflows": [
    "Specific current process → Specific AI automation",
    "Specific current process → Specific AI automation",
    "Specific current process → Specific AI automation",
    "Specific current process → Specific AI automation"
  ],
  "analysis": "2-3 sentence executive summary of their AI readiness. Be specific to their business, not generic. Name their actual tools and opportunities."
}

Rules:
- techStack: Merge what you can infer from the HTML (job boards, meta tags, script sources, API endpoints, link tags, pricing pages) with the pre-detected list. Deduplicate. Include infrastructure (hosting, CDN, DB) if inferable.
- score: AI Readiness Score 0-100. Score based on: how many manual processes are visible (forms, support pages, pricing calculators), how modern their stack is, how many integration points exist for AI. A WordPress brochure site with no integrations = 25-35. A modern SaaS with Stripe + HubSpot + Intercom = 55-70. A company already using AI tools = 70-85.
- savingsEstimate: Annual dollar savings estimate. Be realistic. Base on: number of automatable workflows x avg salary savings. Range $80K-$600K for most businesses.
- workflows: Exactly 4 specific automation opportunities. Format: "Current manual process → AI-powered replacement". Reference their actual tools and pages. Never generic.
- analysis: Make the founder feel like you KNOW their business. Reference specific things from their site.

You are analyzing a real business. Be specific, not generic. If you can see their pricing page, reference their pricing model. If you can see their support page, reference their support workflow. If you can see job postings, reference the roles they're hiring for.`

function truncateHtml(html: string, maxChars: number = 12000): string {
  // Strip scripts, styles, and SVGs to focus on content-bearing HTML
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
  return cleaned.slice(0, maxChars)
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

  // Rate limit
  const limiter = limits.xray()
  if (limiter) {
    const { success } = await limiter.limit(rateKey(req))
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limited', message: 'Too many requests.' },
        { status: 429 }
      )
    }
  }

  // Fetch the website HTML
  let html = ''
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
    html = await response.text()
  } catch {
    // If we can't fetch the site, return fallback
    return NextResponse.json({ ...FALLBACK, domain })
  }

  // Fast regex pre-pass
  const detectedStack = detectTechStack(html)

  // Try Claude analysis. Fall back to heuristics if unavailable.
  try {
    const truncated = truncateHtml(html)

    const raw = await complete({
      model: MODELS.sonnet(),
      maxTokens: 800,
      system: XRAY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Domain: ${domain}\nPre-detected tech: ${detectedStack.join(', ') || 'none detected'}\n\n--- HTML (truncated) ---\n${truncated}`,
        },
      ],
    })

    const parsed = (extractJson<XRayData>(raw) ?? (JSON.parse(raw) as XRayData))

    // Validate and sanitize
    return NextResponse.json({
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack.slice(0, 15) : detectedStack,
      score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 41,
      savingsEstimate: typeof parsed.savingsEstimate === 'number' ? Math.min(800_000, Math.max(50_000, parsed.savingsEstimate)) : 247_000,
      workflows: Array.isArray(parsed.workflows) ? parsed.workflows.slice(0, 4) : GENERIC_WORKFLOWS,
      analysis: typeof parsed.analysis === 'string' ? parsed.analysis : '',
      domain,
    })
  } catch (err) {
    console.error('X-Ray Claude analysis failed, falling back to heuristics:', err)

    // Heuristic fallback (same as before)
    let score = 38
    if (detectedStack.includes('WordPress') || detectedStack.includes('Webflow')) score += 14
    if (detectedStack.includes('Shopify'))    score += 8
    if (detectedStack.includes('Salesforce')) score += 7
    if (detectedStack.includes('HubSpot'))    score += 7
    if (detectedStack.includes('Zendesk'))    score += 7
    if (detectedStack.includes('Intercom'))   score += 7
    if (detectedStack.includes('Klaviyo'))    score += 5
    if (detectedStack.includes('Segment'))    score += 5
    if (detectedStack.includes('Amplitude'))  score += 4
    if (detectedStack.includes('Mixpanel'))   score += 4
    if (detectedStack.includes('Google Analytics')) score += 3
    if (detectedStack.includes('Next.js'))    score -= 5
    score = Math.min(78, Math.max(25, score))

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
      'Stripe':           'Payment events → Revenue forecasting agent',
    }

    const workflows: string[] = []
    for (const tool of detectedStack) {
      if (OPPORTUNITY_MAP[tool] && workflows.length < 4) {
        workflows.push(OPPORTUNITY_MAP[tool])
      }
    }
    for (const g of GENERIC_WORKFLOWS) {
      if (workflows.length >= 4) break
      if (!workflows.includes(g)) workflows.push(g)
    }

    const savingsEstimate = Math.min(600_000, 120_000 + detectedStack.length * 28_000)

    return NextResponse.json({
      techStack: detectedStack.length > 0 ? detectedStack : FALLBACK.techStack,
      score,
      savingsEstimate,
      workflows: workflows.length > 0 ? workflows : FALLBACK.workflows,
      domain,
    })
  }
}
