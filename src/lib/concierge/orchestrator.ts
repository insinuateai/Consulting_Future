import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, cachedSystem, MODELS } from '../anthropic'
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
  const client = anthropic()
  const conversation: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Agentic loop — bounded at 4 turns to prevent runaway.
  for (let turn = 0; turn < 4; turn++) {
    const stream = client.messages.stream({
      model: MODELS.sonnet(),
      max_tokens: 800,
      system: [cachedSystem(SYSTEM_CORE), cachedSystem(COMPANY_KB)],
      tools: CONCIERGE_TOOLS,
      messages: conversation,
    })

    let currentText = ''
    const toolCalls: { id: string; name: string; input: Record<string, unknown> }[] = []

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        currentText += event.delta.text
        yield { type: 'delta', text: event.delta.text }
      }
    }
    const final = await stream.finalMessage()

    // Collect assistant content (text + any tool_use blocks) for the next turn.
    const assistantBlocks: Anthropic.Messages.ContentBlockParam[] = []
    for (const block of final.content) {
      if (block.type === 'text') {
        assistantBlocks.push({ type: 'text', text: block.text })
      } else if (block.type === 'tool_use') {
        assistantBlocks.push({
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        })
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        })
      }
    }
    conversation.push({ role: 'assistant', content: assistantBlocks })

    if (toolCalls.length === 0) {
      // No tools — we're done.
      yield { type: 'complete', message: currentText }
      return
    }

    // Run tools + push results back into the conversation.
    const toolResults: Anthropic.Messages.ContentBlockParam[] = []
    for (const call of toolCalls) {
      yield { type: 'tool', name: call.name, args: call.input }
      const { result } = runTool(call.name, call.input)
      yield { type: 'tool_result', name: call.name, result }
      toolResults.push({
        type: 'tool_result',
        tool_use_id: call.id,
        content: result,
      })
    }
    conversation.push({ role: 'user', content: toolResults })
  }

  yield {
    type: 'error',
    error: 'Max agent turns reached without resolution.',
  }
}
