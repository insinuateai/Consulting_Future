import { supabaseAdmin } from '../supabase'
import type { DossierInput, FullDossier, XrayPrelim } from './types'

/**
 * All Supabase writes for the dossier feature. Every helper is a no-op
 * when SUPABASE_SERVICE_ROLE_KEY is missing (dev mode without backend).
 * Returns null in that case so callers continue gracefully.
 */

// Supabase generated Json type uses an index signature; our domain types use
// named fields. Roundtrip through JSON to satisfy both structurally.
const toJson = <T>(v: T) => JSON.parse(JSON.stringify(v))

function client() {
  try {
    return supabaseAdmin()
  } catch {
    return null
  }
}

export async function upsertLead(input: DossierInput, domain: string): Promise<string | null> {
  const sb = client()
  if (!sb) return null
  const { data, error } = await sb
    .from('leads')
    .upsert(
      {
        email: input.email,
        domain,
        source: 'dossier',
        metadata: { area: input.area, hours: input.hours, team: input.team },
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  if (error || !data) return null
  return data.id as string
}

export async function createPendingDossier(args: {
  slug: string
  leadId: string | null
  domain: string
  input: DossierInput
}): Promise<void> {
  const sb = client()
  if (!sb) return
  await sb.from('dossiers').insert({
    slug: args.slug,
    lead_id: args.leadId,
    domain: args.domain,
    input: toJson(args.input),
    status: 'streaming',
  })
}

export async function completeDossier(
  slug: string,
  dossier: FullDossier,
  xray: XrayPrelim,
  model: string
) {
  const sb = client()
  if (!sb) return
  await sb
    .from('dossiers')
    .update({
      company_name: dossier.companyName,
      industry: dossier.analysis.industry,
      xray: toJson(xray),
      analysis: toJson(dossier.analysis),
      opportunities: toJson(dossier.opportunities),
      competitors: toJson(dossier.competitors),
      model,
      status: 'complete',
      completed_at: new Date().toISOString(),
    })
    .eq('slug', slug)
}

export async function failDossier(slug: string, error: string) {
  const sb = client()
  if (!sb) return
  await sb
    .from('dossiers')
    .update({ status: 'error', error })
    .eq('slug', slug)
}

export async function getDossierBySlug(slug: string): Promise<FullDossier | null> {
  const sb = client()
  if (!sb) return null
  const { data, error } = await sb
    .from('dossiers')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'complete')
    .single()
  if (error || !data) return null
  return {
    slug: data.slug,
    domain: data.domain,
    companyName: data.company_name ?? data.domain,
    input: data.input as unknown as DossierInput,
    xray: (data.xray as unknown as XrayPrelim) ?? {
      domain: data.domain,
      techStack: [],
    },
    analysis:
      (data.analysis as unknown as FullDossier['analysis']) ??
      ({} as FullDossier['analysis']),
    opportunities:
      (data.opportunities as unknown as FullDossier['opportunities']) ?? [],
    competitors:
      (data.competitors as unknown as FullDossier['competitors']) ?? [],
    proposedScope:
      (data.analysis as unknown as { proposedScope?: FullDossier['proposedScope'] })
        ?.proposedScope ?? {
        title: 'The 48-Hour Foundation',
        summary: '',
        deliverables: [],
        timeline: '48 hours',
        investmentRangeUSD: { low: 25_000, high: 50_000 },
      },
    generatedAt: data.completed_at ?? data.created_at,
  }
}
