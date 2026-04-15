import { Resend } from 'resend'
import { requireServerEnv, serverEnv } from './env'

let _client: Resend | null = null

export function resend(): Resend {
  if (_client) return _client
  _client = new Resend(requireServerEnv('RESEND_API_KEY'))
  return _client
}

export const FROM = serverEnv.RESEND_FROM_EMAIL
export const REPLY_TO = serverEnv.RESEND_REPLY_TO

interface SendArgs {
  to: string | string[]
  subject: string
  react?: React.ReactNode
  html?: string
  text?: string
  attachments?: { filename: string; content: Buffer | string }[]
}

export async function sendEmail(args: SendArgs) {
  return resend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    ...args,
  } as Parameters<Resend['emails']['send']>[0])
}
