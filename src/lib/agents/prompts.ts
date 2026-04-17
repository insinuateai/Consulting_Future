// Playground agent prompts — each agent is a single Claude call against the
// user's own data. Output is structured JSON parsed in the route handler.

import { cachedSystem } from '../llm'

export type AgentSlug = 'invoice' | 'leads' | 'support'

export interface AgentSpec {
  slug: AgentSlug
  model: 'haiku' | 'sonnet' | 'opus'
  maxTokens: number
  systemBlocks: ReturnType<typeof cachedSystem>[]
  userPrompt: (input: string) => string
  jsonSchemaHint: string
}

const INVOICE_SYSTEM = `You are an invoice-extraction agent. Given free-form
invoice text (pasted by the user), extract structured fields. Be precise. If a
field is missing, omit it — do NOT hallucinate values. Always include a
confidence score from 0-100 per field based on the clarity of evidence.

Output ONLY a JSON object inside a single \`\`\`json code block matching:
{
  "vendor": { "value": string, "confidence": number },
  "invoiceNumber": { "value": string, "confidence": number },
  "issueDate": { "value": string, "confidence": number },
  "dueDate": { "value": string, "confidence": number },
  "total": { "value": string, "confidence": number },
  "tax": { "value": string, "confidence": number },
  "lineItems": [ { "description": string, "qty": number, "unit": number, "amount": number } ],
  "notes": string
}`

const LEADS_SYSTEM = `You are a lead-scoring agent for Insinuate.ai (an AI
consulting firm selling 48-hour production AI builds at $25k–$200k). Given
lead context pasted by the user, score the lead 0-100 with a band (hot/warm/
cold), a 6-item signals matrix, and a concrete next-action recommendation.

Output ONLY JSON in a \`\`\`json block:
{
  "score": number,
  "band": "hot"|"warm"|"cold",
  "summary": string,
  "signals": [ { "label": string, "weight": number, "matched": boolean } ],
  "rationale": string[],
  "recommendedAction": string,
  "draftOutreach": string
}`

const SUPPORT_SYSTEM = `You are a support-assistant agent. Given a user
question and a knowledge base, answer precisely and cite sources by id. If
the KB lacks coverage, say so honestly. Never invent features or policies.

Output ONLY JSON in a \`\`\`json block:
{
  "answer": string,
  "citations": string[],
  "confidence": "low"|"medium"|"high",
  "followupSuggestions": string[]
}

Knowledge base (kb-id · title · snippet):
- kb-billing-proration · Billing · Mid-cycle plan changes · Proration credits days remaining on upgrade, credits to next invoice on downgrade. Enterprise uses custom schedule.
- kb-api-rate-limits · API rate limits & 429 handling · 60 req/sec default, 120 burst. Exponential backoff from 500ms, respect Retry-After.
- kb-sso-okta · SSO setup with Okta · SAML metadata import, group claims map to roles, JIT provisioning. Available on Business + Enterprise.
- kb-data-export · Exporting your workspace · Full JSON export, retention windows, AES-256 at rest.
- kb-uptime-sla · Uptime SLA and status · 99.95% monthly uptime, credits on breach per contract.`

export const AGENT_SPECS: Record<AgentSlug, AgentSpec> = {
  invoice: {
    slug: 'invoice',
    model: 'sonnet',
    maxTokens: 900,
    systemBlocks: [cachedSystem(INVOICE_SYSTEM)],
    userPrompt: (input) =>
      `Extract the invoice fields from the text below. Output JSON only.\n\n<invoice_text>\n${input}\n</invoice_text>`,
    jsonSchemaHint: 'invoice',
  },
  leads: {
    slug: 'leads',
    model: 'sonnet',
    maxTokens: 900,
    systemBlocks: [cachedSystem(LEADS_SYSTEM)],
    userPrompt: (input) =>
      `Score this lead and draft the next-action outreach. Output JSON only.\n\n<lead_context>\n${input}\n</lead_context>`,
    jsonSchemaHint: 'leads',
  },
  support: {
    slug: 'support',
    model: 'haiku',
    maxTokens: 700,
    systemBlocks: [cachedSystem(SUPPORT_SYSTEM)],
    userPrompt: (input) =>
      `Answer the user's question using only the knowledge base. Cite kb-ids. Output JSON only.\n\n<question>\n${input}\n</question>`,
    jsonSchemaHint: 'support',
  },
}
