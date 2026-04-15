import { NextRequest } from 'next/server'
import { z } from 'zod'
import { runConcierge } from '@/lib/concierge/orchestrator'
import { limits, rateKey } from '@/lib/redis'
import type { ConciergeEvent } from '@/lib/concierge/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(40),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  let input: z.infer<typeof InputSchema>
  try {
    input = InputSchema.parse(await req.json())
  } catch (err) {
    return Response.json({ error: 'Invalid input', details: String(err) }, { status: 400 })
  }

  const limiter = limits.concierge()
  if (limiter) {
    const { success, reset } = await limiter.limit(rateKey(req, input.email ?? null))
    if (!success) {
      return Response.json(
        { error: 'Rate limited', resetAt: reset },
        { status: 429 }
      )
    }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: ConciergeEvent) =>
        controller.enqueue(
          encoder.encode(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
        )
      try {
        for await (const ev of runConcierge(input.messages)) send(ev)
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
