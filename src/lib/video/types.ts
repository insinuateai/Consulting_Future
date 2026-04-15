export interface VideoScript {
  hook: string // first 8 seconds
  body: string[] // 3–4 paragraphs
  closer: string // CTA / sign-off
  totalSeconds: number // target duration
}

export interface VideoRenderResult {
  status: 'queued' | 'rendering' | 'ready' | 'failed' | 'manual'
  scriptText: string
  videoUrl?: string
  audioUrl?: string
  provider: 'heygen' | 'd-id' | 'none'
  error?: string
}

export interface VideoInput {
  companyName: string
  domain: string
  industry?: string
  highlights?: string[] // 3–5 insights from dossier
  recipientEmail: string
  recipientName?: string
}
