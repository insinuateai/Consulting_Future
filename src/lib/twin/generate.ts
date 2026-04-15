import { complete, MODELS, textOf } from '../anthropic'
import type { DigitalTwin } from './types'

const SYSTEM = `
You generate a "digital twin" — a structured JSON description of a
company's current operational stack and its AI-enhanced future state —
for a Three.js visualization. Be opinionated, specific, and realistic.

Rules:
- 8 to 14 nodes total. Spread across columns 0..3 (left → right flow).
- 2–4 "bottleneck" nodes in currentState. They become automated/augmented
  in futureState.
- Each node.kind: system | data | human | agent | integration.
- Edges should form a left→right flow, not a mesh.
- roi[]: 3–5 line items with current vs. future annualized $ impact.
- Short, punchy labels (max 3 words). Notes ≤ 90 chars each.
- No markdown. Return strictly a JSON object matching DigitalTwin.
`.trim()

export async function generateTwin(args: {
  companyName: string
  domain: string
  industry?: string
  summary?: string
  opportunities?: string[]
}): Promise<DigitalTwin> {
  const user = `
Company: ${args.companyName}
Domain: ${args.domain}
Industry: ${args.industry ?? 'unknown'}
Summary: ${args.summary ?? ''}
Opportunities (use at least 2):
${(args.opportunities ?? []).map((o, i) => `${i + 1}. ${o}`).join('\n')}

Return the twin as JSON.
`.trim()

  const msg = await complete({
    model: MODELS.opus(),
    max_tokens: 2400,
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  })

  const raw = textOf(msg)
  const parsed = extract(raw)
  if (!parsed) {
    throw new Error('Twin generator returned no parseable JSON')
  }
  return { companyName: args.companyName, domain: args.domain, ...(parsed as object) } as DigitalTwin
}

function extract(raw: string): unknown | null {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fence ? fence[1] : raw
  const first = body.indexOf('{')
  const last = body.lastIndexOf('}')
  if (first < 0 || last < 0) return null
  try {
    return JSON.parse(body.slice(first, last + 1))
  } catch {
    return null
  }
}
