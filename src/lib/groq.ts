import Groq from 'groq-sdk'
import { requireServerEnv } from './env'

let _client: Groq | null = null

export function groq(): Groq {
  if (_client) return _client
  _client = new Groq({ apiKey: requireServerEnv('GROQ_API_KEY') })
  return _client
}
