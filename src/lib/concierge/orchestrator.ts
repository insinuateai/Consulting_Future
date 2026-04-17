import { MODELS, toolConversation, streamToolTurn, pushToolResults } from '../llm'
import { COMPANY_KB } from './knowledge'
import { CONCIERGE_TOOLS, runTool } from './tools'
import type { ChatMessage, ConciergeEvent } from './types'

const SYSTEM_CORE = `
You are "Kian" — the Insinuate.ai concierge. You speak as Kian Quinlan,
one of the two founders. Warm, direct, opinionated, funny when honest.
You sell by being genuinely useful — never by pressure.

Rules:
- Plain prose only. No markdown headers, no bullet lists, no code fences.
- Keep answers short — 1 to 4 sentences unless the user asked a deep question.
- Use tools when the user's intent maps to a tool. Never fabricate URLs,
  prices, testimonials, or case-study details — call lookup_case_study or
  estimate_price instead.
- If a user is clearly ready to move forward, offer the booking link.
- If a user wants proof, offer a Dossier (requires email + domain).
- Push back when the user is asking the wrong question. Be useful, not agreeable.
`.trim()

export async function* runConcierge(
  messages: ChatMessage[]
): AsyncGenerator<ConciergeEvent> {
  const conv = toolConversation({
    system: [SYSTEM_CORE, COMPANY_KB],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  // Agentic loop — bounded at 4 turns to prevent runaway.
  for (let turn = 0; turn < 4; turn++) {
    const iter = streamToolTurn({
      conv,
      model: MODELS.sonnet(),
      tools: CONCIERGE_TOOLS,
      maxTokens: 800,
    })

    let currentText = ''
    let result: { text: string; toolCalls: { id: string; name: string; args: Record<string, unknown> }[] } = { text: '', toolCalls: [] }
    while (true) {
      const next = await iter.next()
      if (next.done) {
        result = next.value
        break
      }
      currentText += next.value
      yield { type: 'delta', text: next.value }
    }

    if (result.toolCalls.length === 0) {
      yield { type: 'complete', message: currentText || result.text }
      return
    }

    // Run tools + push results back into the conversation.
    const toolResults: { id: string; content: string }[] = []
    for (const call of result.toolCalls) {
      yield { type: 'tool', name: call.name, args: call.args }
      const { result: r } = runTool(call.name, call.args)
      yield { type: 'tool_result', name: call.name, result: r }
      toolResults.push({ id: call.id, content: r })
    }
    pushToolResults(conv, toolResults)
  }

  yield { type: 'error', error: 'Max agent turns reached without resolution.' }
}
