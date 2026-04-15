import { complete, MODELS, textOf } from '../anthropic'

const SYSTEM = `
You generate a "digital employee" persona for a 7-day AI agent trial.
Given a task brief, return a human-feeling employee: a plausible first
name, a concise job title, and a short intro note the user will receive
by email as if from this employee on day 1.

Rules:
- Names must be believable, international, gender-balanced over time.
  Never use "Morgan", "Alex", "Sam", "Riley" (overused).
- Title should match the task — "Junior Analyst", "Ops Coordinator",
  "Research Associate", etc. Not "AI Assistant".
- Intro note: 2 short paragraphs, signed with the name. No markdown.
- Output strictly JSON: { "name": "...", "title": "...", "intro": "..." }
`.trim()

export interface DigitalEmployeePersona {
  name: string
  title: string
  intro: string
}

export async function generatePersona(
  taskBrief: string
): Promise<DigitalEmployeePersona> {
  const msg = await complete({
    model: MODELS.sonnet(),
    max_tokens: 600,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Task brief:\n${taskBrief}\n\nReturn JSON only.`,
      },
    ],
  })
  const raw = textOf(msg)
  const json = extract(raw)
  if (!json) {
    return {
      name: 'Jordan',
      title: 'Ops Analyst',
      intro: `Hi — I'm Jordan, starting today. I'll handle: ${taskBrief.slice(0, 120)}. I'll send you a wrap-up each evening for the next 7 days.\n\nReply anytime and I'll adjust.`,
    }
  }
  return json as DigitalEmployeePersona
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
