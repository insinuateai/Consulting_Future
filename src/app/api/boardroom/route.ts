import { NextRequest } from 'next/server'
import { z } from 'zod'
import { runBoardRoom } from '@/lib/boardroom/orchestrator'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'
import type { BoardRoomEvent } from '@/lib/boardroom/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const InputSchema = z.object({
  topic: z.string().min(4).max(500),
  context: z.string().max(1000).optional(),
  dossierSlug: z.string().min(3).max(200).optional(),
  email: z.string().email().optional(),
})

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

  // Rate-limit by IP (+ email if provided). Same bucket as dossier — expensive.
  const limiter = limits.dossier()
  if (limiter) {
    const { success, reset } = await limiter.limit(
      rateKey(req, parsed.email ?? 'anon')
    )
    if (!success) {
      return Response.json(
        { error: 'Rate limited', resetAt: reset },
        { status: 429 }
      )
    }
  }

  if (parsed.email) {
    await track(parsed.email, EVENTS.DOSSIER_REQUESTED, {
      topic: parsed.topic,
      kind: 'boardroom',
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: BoardRoomEvent) => {
        controller.enqueue(
          encoder.encode(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
        )
      }
      try {
        for await (const ev of runBoardRoom(parsed)) {
          send(ev)
        }
      } catch (err) {
        send({ type: 'error', error: String(err) })
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
