// Back-compat re-export shim. The project originally used the Anthropic SDK
// directly; the provider layer now lives in `./llm.ts` (Groq-backed).
// Existing imports from '@/lib/anthropic' keep working for MODELS / cachedSystem.
// All call sites using `anthropic().messages.*` have moved to stream/complete
// helpers in `./llm.ts`.

export { MODELS, cachedSystem, stream, complete, completeJson, extractJson } from './llm'
export type { LLMMessage, LLMStreamParams, LLMTool, LLMToolCall } from './llm'
