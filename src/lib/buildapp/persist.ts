import { supabaseAdmin } from '../supabase'
import type { BuildPlan, GeneratedFile } from './types'

const toJson = <T>(v: T) => JSON.parse(JSON.stringify(v))

function client() {
  try {
    return supabaseAdmin()
  } catch {
    return null
  }
}

export async function createGeneratedApp(args: {
  prompt: string
  email?: string | null
}): Promise<string | null> {
  const sb = client()
  if (!sb) {
    // Dev fallback: return a pseudo-id (apps won't be sharable but UX still works)
    return `local-${Math.random().toString(36).slice(2, 10)}`
  }
  let leadId: string | null = null
  if (args.email) {
    const { data } = await sb
      .from('leads')
      .upsert({ email: args.email, source: 'build_app' }, { onConflict: 'email' })
      .select('id')
      .single()
    leadId = (data?.id as string | undefined) ?? null
  }
  const { data, error } = await sb
    .from('generated_apps')
    .insert({ prompt: args.prompt, lead_id: leadId, status: 'building' })
    .select('id')
    .single()
  if (error || !data) return null
  return data.id as string
}

export async function completeGeneratedApp(args: {
  appId: string
  plan: BuildPlan
  files: GeneratedFile[]
  deployUrl: string
  repoUrl?: string
}) {
  const sb = client()
  if (!sb) return
  await sb
    .from('generated_apps')
    .update({
      app_name: args.plan.appName,
      summary: args.plan.summary,
      files: toJson(args.files),
      deploy_url: args.deployUrl,
      repo_url: args.repoUrl ?? null,
      status: 'ready',
      ready_at: new Date().toISOString(),
    })
    .eq('id', args.appId)
}

export async function failGeneratedApp(appId: string, error: string) {
  const sb = client()
  if (!sb) return
  await sb
    .from('generated_apps')
    .update({ status: 'failed', error })
    .eq('id', appId)
}

export async function getGeneratedApp(appId: string): Promise<{
  id: string
  prompt: string
  appName: string | null
  summary: string | null
  files: GeneratedFile[]
  deployUrl: string | null
  status: string
} | null> {
  const sb = client()
  if (!sb) return null
  const { data, error } = await sb
    .from('generated_apps')
    .select('*')
    .eq('id', appId)
    .single()
  if (error || !data) return null
  return {
    id: data.id,
    prompt: data.prompt,
    appName: data.app_name,
    summary: data.summary,
    files: (data.files as unknown as GeneratedFile[]) ?? [],
    deployUrl: data.deploy_url,
    status: data.status,
  }
}
