import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL_OPUS: z.string().default('claude-opus-4-6'),
  ANTHROPIC_MODEL_SONNET: z.string().default('claude-sonnet-4-6'),
  ANTHROPIC_MODEL_HAIKU: z.string().default('claude-haiku-4-5-20251001'),

  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default('Insinuate <hello@insinuate.ai>'),
  RESEND_REPLY_TO: z.string().default('hello@insinuate.ai'),

  POSTHOG_PERSONAL_API_KEY: z.string().optional(),

  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),

  HEYGEN_API_KEY: z.string().optional(),
  HEYGEN_AVATAR_ID: z.string().optional(),

  E2B_API_KEY: z.string().optional(),

  VERCEL_API_TOKEN: z.string().optional(),
  VERCEL_TEAM_ID: z.string().optional(),

  GITHUB_APP_ID: z.string().optional(),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_PAT: z.string().optional(),

  PANDADOC_API_KEY: z.string().optional(),

  CALENDLY_API_TOKEN: z.string().optional(),
  CALENDLY_USER_URI: z.string().optional(),

  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_SIGNING_SECRET: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default('https://us.i.posthog.com'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PAYMENT_LINK: z.string().url().optional(),
  NEXT_PUBLIC_PAYMENT_LINK_LABEL: z
    .string()
    .default('Pay $2,500 deposit · skip the calculator'),
  NEXT_PUBLIC_CALENDLY_URL: z
    .string()
    .url()
    .default('https://calendly.com/kianjquinlan/30min'),
})

export const serverEnv = serverSchema.parse(process.env)
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PAYMENT_LINK: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK,
  NEXT_PUBLIC_PAYMENT_LINK_LABEL: process.env.NEXT_PUBLIC_PAYMENT_LINK_LABEL,
  NEXT_PUBLIC_CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL,
})

export function requireServerEnv<K extends keyof typeof serverEnv>(
  key: K
): NonNullable<(typeof serverEnv)[K]> {
  const v = serverEnv[key]
  if (v == null || v === '') {
    throw new Error(
      `Missing required env var: ${key}. Set it in .env.local or your deploy environment.`
    )
  }
  return v as NonNullable<(typeof serverEnv)[K]>
}
