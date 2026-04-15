import { NextRequest } from 'next/server'
import { z } from 'zod'
import { anthropic, MODELS, cachedSystem, textOf } from '@/lib/anthropic'
import { limits, rateKey } from '@/lib/redis'
import { SYNOPSIS_SYSTEM_PROMPT } from '@/lib/intake/prompts'
import type { Synopsis } from '@/lib/intake/types'

export const runtime = 'nodejs'
export const maxDuration = 120

const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
})

const FALLBACK_SYNOPSIS: Synopsis = {
  vision:
    'Your business has the potential to operate itself while you focus on growth.',
  agenticWorkflow:
    'AI agents will handle your intake, qualification, follow-up, and reporting — running 24/7 in the background.',
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
      max_tokens: 1200,
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
      synopsis = FALLBACK_SYNOPSIS
    }

    return Response.json({ synopsis })
  } catch (err) {
    console.error('Synopsis generation failed:', err)
    return Response.json({ synopsis: FALLBACK_SYNOPSIS })
  }
}
