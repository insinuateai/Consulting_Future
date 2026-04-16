import { NextRequest } from 'next/server'
import { z } from 'zod'
import { anthropic, MODELS, cachedSystem, textOf } from '@/lib/anthropic'
import { limits, rateKey } from '@/lib/redis'
import { SYNOPSIS_SYSTEM_PROMPT } from '@/lib/intake/prompts'
import { sendEmail } from '@/lib/resend'
import type { Synopsis } from '@/lib/intake/types'
import { clientEnv, serverEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const maxDuration = 120

const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  email: z.string().email().optional(),
})

const FALLBACK_SYNOPSIS: Synopsis = {
  vision:
    'Your business has the potential to operate itself while you focus on growth.',
  agenticWorkflow:
    'AI agents will handle your intake, qualification, follow-up, and reporting, running 24/7 in the background.',
  mvpRoadmap: [
    'Step 1: Map your core workflow and data model in Supabase',
    'Step 2: Build your intake UI in React with real-time updates',
    'Step 3: Deploy on Vercel and activate your first automation',
  ],
  businessType: 'Your Business',
  appSpec: {
    name: 'FlowPilot',
    tagline: 'Automate your core workflow from intake to delivery',
    pages: [
      { name: 'Dashboard', description: 'Overview of key metrics and recent activity' },
      { name: 'Intake', description: 'Form to capture new requests from customers' },
      { name: 'Pipeline', description: 'Track items through your workflow stages' },
      { name: 'Reports', description: 'Analytics and performance insights' },
    ],
    dataModel: ['Requests', 'Customers', 'Tasks', 'Reports'],
    keyFeatures: [
      'Automated intake processing',
      'Real-time status tracking',
      'Performance analytics dashboard',
    ],
    aesthetic:
      'Dark professional theme with cyan accents, card-based layout, data-forward design',
  },
}

/** Persist intake session to Supabase (fire-and-forget, never blocks response). */
async function persistSession(
  messages: { role: string; content: string }[],
  synopsis: Synopsis,
  email?: string
) {
  const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const db = supabaseAdmin()
    await db.from('intake_sessions').insert({
      messages: messages as unknown as import('@/lib/supabase.types').Json,
      synopsis: synopsis as unknown as import('@/lib/supabase.types').Json,
      email: email ?? null,
      status: 'synopsis',
    })
  } catch (err) {
    console.error('Failed to persist intake session:', err)
  }
}

/** Email the Game Plan to the user (fire-and-forget). */
async function emailGamePlan(email: string, synopsis: Synopsis) {
  if (!serverEnv.RESEND_API_KEY) return

  const { appSpec, vision, agenticWorkflow, mvpRoadmap, businessType } = synopsis
  const roadmapHtml = mvpRoadmap
    .map((step, i) => `<li style="margin-bottom:8px;color:#d4d0c8;">${i + 1}. ${step}</li>`)
    .join('')
  const pagesHtml = appSpec.pages
    .map((p) => `<li style="color:#d4d0c8;"><strong style="color:#00F0FF;">${p.name}</strong> — ${p.description}</li>`)
    .join('')

  try {
    await sendEmail({
      to: email,
      subject: `Your Game Plan: ${appSpec.name} — ${businessType}`,
      html: `
        <div style="font-family:'Geist Sans',system-ui,sans-serif;background:#030303;color:#F0EDE6;padding:40px 24px;max-width:600px;margin:0 auto;">
          <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#00F0FF;margin-bottom:8px;">
            Game Plan · ${businessType}
          </div>
          <h1 style="font-size:32px;margin:0 0 8px;color:#F0EDE6;font-weight:400;">
            ${appSpec.name}
          </h1>
          <p style="font-size:16px;color:#F0EDE680;margin:0 0 32px;">${appSpec.tagline}</p>

          <div style="border-top:1px solid #F0EDE620;padding-top:24px;margin-bottom:24px;">
            <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#F0EDE640;margin-bottom:12px;">01 · Vision</div>
            <p style="color:#F0EDE6cc;line-height:1.7;">${vision}</p>
          </div>

          <div style="border-top:1px solid #F0EDE620;padding-top:24px;margin-bottom:24px;">
            <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#F0EDE640;margin-bottom:12px;">02 · Agentic Workflow</div>
            <p style="color:#F0EDE6cc;line-height:1.7;">${agenticWorkflow}</p>
          </div>

          <div style="border-top:1px solid #F0EDE620;padding-top:24px;margin-bottom:24px;">
            <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#F0EDE640;margin-bottom:12px;">03 · MVP Roadmap</div>
            <ol style="padding-left:0;list-style:none;margin:0;">${roadmapHtml}</ol>
          </div>

          <div style="border-top:1px solid #F0EDE620;padding-top:24px;margin-bottom:24px;">
            <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#F0EDE640;margin-bottom:12px;">04 · App Blueprint</div>
            <ul style="padding-left:0;list-style:none;margin:0;">${pagesHtml}</ul>
          </div>

          <div style="text-align:center;padding:32px 0;border-top:1px solid #F0EDE620;">
            <a href="https://calendly.com/kianjquinlan/30min" style="display:inline-block;background:#00F0FF;color:#030303;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">
              Book the 48-Hour Build →
            </a>
            <p style="color:#F0EDE640;font-size:12px;margin-top:12px;">
              We build your production version in 48 hours. No commitment needed.
            </p>
          </div>

          <p style="font-size:11px;color:#F0EDE630;text-align:center;">
            Insinuate.ai — we don't consult, we build.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to email game plan:', err)
  }
}

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof InputSchema>
  try {
    parsed = InputSchema.parse(await req.json())
  } catch (err) {
    return Response.json(
      { error: 'Invalid input', details: String(err) },
      { status: 400 }
    )
  }

  const limiter = limits.dossier()
  if (limiter) {
    const { success } = await limiter.limit(rateKey(req))
    if (!success) {
      return Response.json(
        { error: 'Rate limited', message: 'Too many requests.' },
        { status: 429 }
      )
    }
  }

  try {
    const completion = await anthropic().messages.create({
      model: MODELS.opus(),
      max_tokens: 1500,
      system: [cachedSystem(SYNOPSIS_SYSTEM_PROMPT)],
      messages: [
        ...parsed.messages.map(({ role, content }) => ({
          role: role as 'user' | 'assistant',
          content,
        })),
        {
          role: 'user',
          content:
            'Generate the Game Plan now based on everything I\'ve shared.',
        },
      ],
    })

    const raw = textOf(completion)
    let synopsis: Synopsis
    try {
      synopsis = JSON.parse(raw)
    } catch {
      // Try to extract JSON from markdown fences
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try {
          synopsis = JSON.parse(jsonMatch[1])
        } catch {
          synopsis = FALLBACK_SYNOPSIS
        }
      } else {
        synopsis = FALLBACK_SYNOPSIS
      }
    }

    // Fire-and-forget: persist + email (don't block the response)
    persistSession(parsed.messages, synopsis, parsed.email).catch(() => {})
    if (parsed.email) {
      emailGamePlan(parsed.email, synopsis).catch(() => {})
    }

    return Response.json({ synopsis })
  } catch (err) {
    console.error('Synopsis generation failed:', err)
    return Response.json({ synopsis: FALLBACK_SYNOPSIS })
  }
}
