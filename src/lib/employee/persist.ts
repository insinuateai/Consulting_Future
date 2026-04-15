import { supabaseAdmin } from '../supabase'
import type { DigitalEmployeePersona } from './persona'

function client() {
  try {
    return supabaseAdmin()
  } catch {
    return null
  }
}

export async function createDigitalEmployee(args: {
  email: string
  persona: DigitalEmployeePersona
  taskBrief: string
  slackTeamId?: string | null
}): Promise<{ id: string | null }> {
  const sb = client()
  if (!sb) return { id: null }
  const { data: lead } = await sb
    .from('leads')
    .upsert(
      { email: args.email, source: 'digital_employee' },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  const leadId = (lead?.id as string | undefined) ?? null

  const { data, error } = await sb
    .from('digital_employees')
    .insert({
      lead_id: leadId,
      name: args.persona.name,
      role: args.persona.title,
      task_brief: args.taskBrief,
      slack_team_id: args.slackTeamId ?? null,
      status: 'active',
    })
    .select('id')
    .single()
  if (error || !data) return { id: null }
  return { id: data.id as string }
}
