import { PostHog } from 'posthog-node'
import { clientEnv } from './env'

let _server: PostHog | null = null

/** Server-side PostHog client. Use in route handlers + server actions. */
export function posthogServer(): PostHog | null {
  const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  if (_server) return _server
  _server = new PostHog(key, {
    host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
  return _server
}

/** Fire-and-forget server-side event. No-op if PostHog not configured. */
export async function track(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = posthogServer()
  if (!ph) return
  ph.capture({ distinctId, event, properties })
  await ph.flush().catch(() => {})
}

export const EVENTS = {
  XRAY_GENERATED: 'xray_generated',
  DOSSIER_REQUESTED: 'dossier_requested',
  DOSSIER_GENERATED: 'dossier_generated',
  DOSSIER_SHARED: 'dossier_shared',
  EMAIL_CAPTURED: 'email_captured',
  PLAYGROUND_AGENT_RUN: 'playground_agent_run',
  BOARDROOM_RUN: 'boardroom_run',
  APP_GENERATED: 'app_generated',
  VIDEO_QUEUED: 'video_queued',
  CONCIERGE_MESSAGE: 'concierge_message',
  SCOPE_BUILT: 'scope_built',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CALL_BOOKED: 'call_booked',
  DIGITAL_EMPLOYEE_TRIAL: 'digital_employee_trial',
  WORKFORCE_OPTIMIZER_RUN: 'workforce_optimizer_run',
  VOICE_SESSION_STARTED: 'voice_session_started',
} as const
