import { NextRequest } from 'next/server'
import { z } from 'zod'
import { MODELS } from '@/lib/llm'
import { runDossier } from '@/lib/dossier/orchestrator'
import {
  upsertLead,
  createPendingDossier,
  completeDossier,
  failDossier,
} from '@/lib/dossier/persist'
import { dossierSlug } from '@/lib/slug'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'
import { emailDossierReady } from '@/lib/dossier/email'
import type { DossierEvent, FullDossier } from '@/lib/dossier/types'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — Vercel pro plan supports this

const InputSchema = z.object({
  url: z.string().url(),
  email: z.string().email(),
  area: z.string().min(2).max(500),
  hours: z.string().min(1).max(50),
  team: z.string().min(1).max(50),
})

export async function POST(req: NextRequest) {
  // ---- 1. Parse + validate ---------------------------------------------------
  let parsed
  try {
    const body = await req.json()
    parsed = InputSchema.parse(body)
  } catch (err) {
    return Response.json(
      { error: 'Invalid input', details: String(err) },
      { status: 400 }
    )
  }

  // ---- 2. Rate-limit by email + IP (fail-open if Redis not configured) -----
  const limiter = limits.dossier()
  if (limiter) {
    const key = rateKey(req, parsed.email)
    const { success, reset } = await limiter.limit(key)
    if (!success) {
      return Response.json(
        {
          error: 'Rate limited',
          message: 'Five dossiers per hour. Try again shortly.',
          resetAt: reset,
        },
        { status: 429 }
      )
    }
  }

  // ---- 3. Provision lead + dossier rows -------------------------------------
  let domain = ''
  try {
    domain = new URL(parsed.url).hostname.replace(/^www\./, '')
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }
  const slug = dossierSlug(domain)
  const leadId = await upsertLead(parsed, domain)
  await createPendingDossier({ slug, leadId, domain, input: parsed })

  await track(parsed.email, EVENTS.DOSSIER_REQUESTED, {
    domain,
    area: parsed.area,
  })

  // ---- 4. SSE stream of orchestrator events ---------------------------------
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: DossierEvent) => {
        controller.enqueue(
          encoder.encode(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
        )
      }
      let final: FullDossier | null = null
      try {
        for await (const ev of runDossier(slug, parsed)) {
          send(ev)
          if (ev.type === 'complete') final = ev.dossier
          if (ev.type === 'error') {
            await failDossier(slug, ev.error)
          }
        }
        if (final) {
          await completeDossier(
            slug,
            final,
            final.xray,
            `${MODELS.opus()}+${MODELS.sonnet()}+${MODELS.haiku()}`
          )
          await track(parsed.email, EVENTS.DOSSIER_GENERATED, {
            domain,
            slug,
          })
          // Fire-and-forget email
          void emailDossierReady(parsed.email, final)
        }
      } catch (err) {
        const msg = String(err)
        await failDossier(slug, msg)
        send({ type: 'error', error: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
