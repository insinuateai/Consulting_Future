import * as Sentry from '@sentry/nextjs'
import { clientEnv, serverEnv } from './env'

let initialized = false

/**
 * Initialize Sentry. Called from instrumentation.ts on the server and from
 * the PostHog provider on the client. Idempotent.
 */
export function initSentry() {
  if (initialized) return
  const dsn = clientEnv.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: serverEnv.NODE_ENV,
    tracesSampleRate: serverEnv.NODE_ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
  })
  initialized = true
}

export { Sentry }
