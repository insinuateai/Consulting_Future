import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { clientEnv, requireServerEnv } from './env'
import type { Database } from './supabase.types'

// Supabase v2.46 changed SupabaseClient to a 4-arg generic. We only care about
// the Database shape — cast through unknown to keep call sites ergonomic.
type Client = SupabaseClient<Database>

/** Browser client — anon key, RLS-enforced, safe for client components. */
export function supabaseBrowser(): Client {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase browser env vars missing')
  }
  return createBrowserClient<Database>(url, key) as unknown as Client
}

/**
 * Server client bound to a Next.js request — anon key + cookies for SSR auth.
 * Use in Server Components and Route Handlers when acting as the user.
 */
export function supabaseServer(cookies: {
  getAll: () => { name: string; value: string }[]
  setAll: (
    items: { name: string; value: string; options?: Record<string, unknown> }[]
  ) => void
}): Client {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL
  const key = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase server env vars missing')
  }
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: cookies.getAll,
      setAll: cookies.setAll,
    },
  }) as unknown as Client
}

/**
 * Service-role admin client — bypasses RLS. NEVER expose to client. Use only
 * in route handlers/server actions for trusted writes (lead capture, dossier
 * persistence, webhook handlers).
 */
export function supabaseAdmin(): Client {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL missing')
  return createClient<Database>(url, requireServerEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as Client
}
