import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { serverEnv } from './env'

let _redis: Redis | null = null

/** Returns Upstash Redis client, or null if env not configured. */
export function redis(): Redis | null {
  if (_redis) return _redis
  const url = serverEnv.UPSTASH_REDIS_REST_URL
  const token = serverEnv.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

/**
 * Per-feature rate limiters. Tune `limit` and `window` per feature.
 * Returns null when Redis isn't configured (dev mode) — caller should
 * fail-open in dev, fail-closed in prod.
 */
export function rateLimiter(
  prefix: string,
  limit: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
): Ratelimit | null {
  const r = redis()
  if (!r) return null
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `insinuate:rl:${prefix}`,
    analytics: true,
  })
}

/** Common limiters — keep in one place so they share Redis pool. */
export const limits = {
  xray: () => rateLimiter('xray', 30, '1 m'),
  dossier: () => rateLimiter('dossier', 5, '1 h'),
  playgroundAgent: () => rateLimiter('agent', 20, '1 h'),
  boardroom: () => rateLimiter('boardroom', 5, '1 h'),
  buildApp: () => rateLimiter('build_app', 3, '1 d'),
  concierge: () => rateLimiter('concierge', 60, '1 h'),
  voice: () => rateLimiter('voice', 30, '1 h'),
  workforce: () => rateLimiter('workforce', 10, '1 d'),
}

/**
 * Returns identifier from request — prefers verified email if provided,
 * falls back to IP. Use as the `key` for rate limiters.
 */
export function rateKey(req: Request, email?: string | null): string {
  if (email) return `email:${email.toLowerCase().trim()}`
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'anon'
  return `ip:${ip}`
}
