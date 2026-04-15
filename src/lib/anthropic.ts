import Anthropic from '@anthropic-ai/sdk'
import { requireServerEnv, serverEnv } from './env'

let _client: Anthropic | null = null

export function anthropic(): Anthropic {
  if (_client) return _client
  _client = new Anthropic({
    apiKey: requireServerEnv('ANTHROPIC_API_KEY'),
  })
  return _client
}

export const MODELS = {
  opus: () => serverEnv.ANTHROPIC_MODEL_OPUS,
  sonnet: () => serverEnv.ANTHROPIC_MODEL_SONNET,
  haiku: () => serverEnv.ANTHROPIC_MODEL_HAIKU,
} as const

/**
 * Mark a system-prompt block as cacheable. Use for stable prefixes (system
 * prompts, tool defs, knowledge base) — Anthropic prompt cache has 5min TTL.
 * 90%+ cost savings on repeat invocations.
 */
export function cachedSystem(text: string): Anthropic.Messages.TextBlockParam {
  // cache_control is a runtime-supported prompt-cache marker; the base SDK
  // type lives in the beta namespace, so we cast to keep ergonomics clean.
  return {
    type: 'text',
    text,
    cache_control: { type: 'ephemeral' },
  } as unknown as Anthropic.Messages.TextBlockParam
}

/**
 * Stream a Claude completion. Returns the SSE stream — caller pipes to client.
 * Use for: dossier generation, board room debates, agent swarm theater.
 */
export function streamMessage(params: Anthropic.Messages.MessageStreamParams) {
  return anthropic().messages.stream(params)
}

/**
 * One-shot completion. Use for: short classification, scoring, structured
 * extraction. Reach for streaming when output is user-facing and >2 seconds.
 */
export async function complete(
  params: Anthropic.Messages.MessageCreateParamsNonStreaming
) {
  return anthropic().messages.create(params)
}

/** Helper: extract first text block from a non-streaming response. */
export function textOf(msg: Anthropic.Messages.Message): string {
  const block = msg.content.find((b) => b.type === 'text')
  return block && block.type === 'text' ? block.text : ''
}
