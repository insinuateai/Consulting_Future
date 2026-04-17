import type { Groq } from 'groq-sdk'
import { serverEnv } from './env'
import { groq } from './groq'

export type LLMRole = 'user' | 'assistant'

export interface LLMMessage {
  role: LLMRole
  content: string
}

export interface LLMStreamParams {
  model: string
  system?: string | string[]
  messages: LLMMessage[]
  maxTokens?: number
  temperature?: number
}

type ChatMessageParam = Groq.Chat.Completions.ChatCompletionMessageParam

export const MODELS = {
  opus: () => serverEnv.GROQ_MODEL_SMART,
  sonnet: () => serverEnv.GROQ_MODEL_MID,
  haiku: () => serverEnv.GROQ_MODEL_FAST,
} as const

/**
 * Anthropic-era prompt-cache marker. Groq has no caching — we keep the
 * function so existing call sites don't have to change, but it now
 * returns a plain string that gets concatenated into the system prompt.
 */
export function cachedSystem(text: string): string {
  return text
}

/** Flatten system blocks into a single string (Groq only takes one). */
function flattenSystem(system: string | string[] | undefined): string | undefined {
  if (!system) return undefined
  if (typeof system === 'string') return system
  return system.filter(Boolean).join('\n\n')
}

function toChatMessages(params: LLMStreamParams): ChatMessageParam[] {
  const msgs: ChatMessageParam[] = []
  const sys = flattenSystem(params.system)
  if (sys) msgs.push({ role: 'system', content: sys })
  for (const m of params.messages) msgs.push({ role: m.role, content: m.content })
  return msgs
}

/** Stream text deltas. Use for user-facing generation. */
export async function* stream(params: LLMStreamParams): AsyncGenerator<string> {
  const completion = await groq().chat.completions.create({
    model: params.model,
    messages: toChatMessages(params),
    max_tokens: params.maxTokens,
    temperature: params.temperature ?? 0.7,
    stream: true,
  })
  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}

/** Collect a full streamed response — handy when you need the text + want to stream it. */
export async function streamCollect(
  params: LLMStreamParams,
  onDelta?: (chunk: string) => void
): Promise<string> {
  let full = ''
  for await (const d of stream(params)) {
    full += d
    onDelta?.(d)
  }
  return full
}

/** One-shot completion. Returns the full text. */
export async function complete(params: LLMStreamParams): Promise<string> {
  const completion = await groq().chat.completions.create({
    model: params.model,
    messages: toChatMessages(params),
    max_tokens: params.maxTokens,
    temperature: params.temperature ?? 0.7,
    stream: false,
  })
  return completion.choices[0]?.message?.content ?? ''
}

/** One-shot completion that parses JSON from the response (fenced or raw). */
export async function completeJson<T = unknown>(
  params: LLMStreamParams
): Promise<T | null> {
  const text = await complete(params)
  return extractJson<T>(text)
}

/** Extract JSON from a model response — handles code fences and loose braces. */
export function extractJson<T = unknown>(raw: string): T | null {
  if (!raw) return null
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fence ? fence[1] : raw
  const first = body.indexOf('{')
  const last = body.lastIndexOf(']') > body.lastIndexOf('}') ? body.lastIndexOf(']') : body.lastIndexOf('}')
  if (first < 0 || last < 0 || last < first) {
    try { return JSON.parse(body.trim()) as T } catch { return null }
  }
  try {
    return JSON.parse(body.slice(first, last + 1)) as T
  } catch {
    try { return JSON.parse(body.trim()) as T } catch { return null }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool use — OpenAI function-calling shape (Groq-native)
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface LLMToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ToolStreamParams extends LLMStreamParams {
  tools: LLMTool[]
}

export interface ToolTurnResult {
  text: string
  toolCalls: LLMToolCall[]
}

export interface ToolConversation {
  messages: ChatMessageParam[]
}

/** Start a tool-aware conversation from a system prompt + seed messages. */
export function toolConversation(params: {
  system?: string | string[]
  messages: LLMMessage[]
}): ToolConversation {
  const msgs: ChatMessageParam[] = []
  const sys = flattenSystem(params.system)
  if (sys) msgs.push({ role: 'system', content: sys })
  for (const m of params.messages) msgs.push({ role: m.role, content: m.content })
  return { messages: msgs }
}

/** Append tool results to the conversation. */
export function pushToolResults(
  conv: ToolConversation,
  results: { id: string; content: string }[]
): void {
  for (const r of results) {
    conv.messages.push({ role: 'tool', tool_call_id: r.id, content: r.content })
  }
}

/**
 * Stream one assistant turn that may include tool calls. Yields text deltas
 * as they arrive. On completion, returns the full text + any tool calls +
 * mutates the conversation to include the assistant message.
 */
export async function* streamToolTurn(params: {
  conv: ToolConversation
  model: string
  tools: LLMTool[]
  maxTokens?: number
  temperature?: number
}): AsyncGenerator<string, ToolTurnResult> {
  const tools = params.tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))

  const completion = await groq().chat.completions.create({
    model: params.model,
    messages: params.conv.messages,
    tools,
    tool_choice: 'auto',
    max_tokens: params.maxTokens,
    temperature: params.temperature ?? 0.7,
    stream: true,
  })

  let text = ''
  // Accumulate streaming tool_calls deltas keyed by index.
  const toolCallBuf: Record<
    number,
    { id?: string; name?: string; arguments: string }
  > = {}

  for await (const chunk of completion) {
    const choice = chunk.choices[0]
    if (!choice) continue
    const delta = choice.delta as {
      content?: string | null
      tool_calls?: {
        index: number
        id?: string
        function?: { name?: string; arguments?: string }
      }[]
    }
    if (delta.content) {
      text += delta.content
      yield delta.content
    }
    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const slot = toolCallBuf[tc.index] ?? { arguments: '' }
        if (tc.id) slot.id = tc.id
        if (tc.function?.name) slot.name = tc.function.name
        if (tc.function?.arguments) slot.arguments += tc.function.arguments
        toolCallBuf[tc.index] = slot
      }
    }
  }

  const toolCalls: LLMToolCall[] = Object.values(toolCallBuf)
    .filter((c) => c.id && c.name)
    .map((c) => {
      let args: Record<string, unknown> = {}
      try {
        args = c.arguments ? (JSON.parse(c.arguments) as Record<string, unknown>) : {}
      } catch {
        args = {}
      }
      return { id: c.id!, name: c.name!, args }
    })

  // Mutate conversation with the assistant message.
  params.conv.messages.push({
    role: 'assistant',
    content: text || null,
    tool_calls: toolCalls.length
      ? toolCalls.map((t) => ({
          id: t.id,
          type: 'function' as const,
          function: { name: t.name, arguments: JSON.stringify(t.args) },
        }))
      : undefined,
  })

  return { text, toolCalls }
}
