export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ConciergeInput {
  messages: ChatMessage[]
  email?: string
}

export type ConciergeEvent =
  | { type: 'delta'; text: string }
  | { type: 'tool'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'complete'; message: string }
  | { type: 'error'; error: string }
