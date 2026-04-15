import { supabaseAdmin } from '../supabase'
import type { ScopeLine } from './catalog'
import { priceScope } from './catalog'

const toJson = <T>(v: T) => JSON.parse(JSON.stringify(v))

function client() {
  try {
    return supabaseAdmin()
  } catch {
    return null
  }
}

export async function createScope(args: {
  email: string
  companyName?: string
  lines: ScopeLine[]
}): Promise<{ id: string | null; subtotalCents: number; totalCents: number }> {
  const { subtotalCents, totalCents, items } = priceScope(args.lines)
  const sb = client()
  if (!sb) {
    return { id: null, subtotalCents, totalCents }
  }

  const { data: lead } = await sb
    .from('leads')
    .upsert(
      { email: args.email, source: 'scope', company: args.companyName ?? null },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  const leadId = (lead?.id as string | undefined) ?? null

  const { data, error } = await sb
    .from('scopes')
    .insert({
      lead_id: leadId,
      line_items: toJson(items.map((i) => ({ id: i.line.id, qty: i.qty }))),
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      status: 'draft',
    })
    .select('id')
    .single()
  if (error || !data) return { id: null, subtotalCents, totalCents }
  return { id: data.id as string, subtotalCents, totalCents }
}

export async function attachStripeSession(
  scopeId: string,
  stripeSessionId: string
) {
  const sb = client()
  if (!sb) return
  await sb
    .from('scopes')
    .update({ stripe_session_id: stripeSessionId, status: 'sent' })
    .eq('id', scopeId)
}

export async function attachSow(scopeId: string, sowPandadocId: string) {
  const sb = client()
  if (!sb) return
  await sb
    .from('scopes')
    .update({ sow_pandadoc_id: sowPandadocId })
    .eq('id', scopeId)
}
