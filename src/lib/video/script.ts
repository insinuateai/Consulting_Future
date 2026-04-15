import { complete, MODELS, textOf } from '../anthropic'
import type { VideoInput, VideoScript } from './types'

const SYSTEM = `
You are writing a 90-second personalized video script for Kian Quinlan,
co-founder of Insinuate.ai, to send to a specific prospect. It will be
spoken in his voice by an avatar. Constraints:

- Total runtime ~90 seconds = ~220 words max.
- First 8 seconds must hook — use their company name and a specific detail
  from the highlights.
- Middle = 3 paragraphs, each tying one highlight to a concrete outcome.
- Closer = warm sign-off + "reply to this email" CTA. No hard sell.
- Conversational tone, short sentences, no filler, no fluff.
- Never fabricate names, numbers, or competitors — if unsure, speak generally.
- No markdown. Plain prose.

Return strictly a JSON object:
{
  "hook": "string",
  "body": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "closer": "string",
  "totalSeconds": 90
}
`.trim()

export async function generateVideoScript(
  input: VideoInput
): Promise<VideoScript> {
  const user = `
Prospect: ${input.recipientName ?? 'there'}
Company: ${input.companyName} (${input.domain})
Industry: ${input.industry ?? 'unknown'}
Key insights from their dossier (use at least 2):
${(input.highlights ?? []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

Write the script now.
`.trim()

  const msg = await complete({
    model: MODELS.sonnet(),
    max_tokens: 1200,
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  })

  const raw = textOf(msg)
  const json = extractJson(raw)
  if (!json) {
    throw new Error('Script generator returned no parseable JSON')
  }
  return json as VideoScript
}

export function scriptToText(s: VideoScript): string {
  return [s.hook, ...s.body, s.closer].join('\n\n')
}

function extractJson(raw: string): unknown | null {
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
