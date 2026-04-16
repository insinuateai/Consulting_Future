import { NextRequest } from 'next/server'
import { z } from 'zod'
import { anthropic, MODELS, cachedSystem } from '@/lib/anthropic'
import { limits, rateKey } from '@/lib/redis'
import { DISCOVERY_SYSTEM_PROMPT } from '@/lib/intake/prompts'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
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

  const limiter = limits.concierge()
  if (limiter) {
    const { success } = await limiter.limit(rateKey(req))
    if (!success) {
      return Response.json(
        { error: 'Rate limited', message: 'Too many requests. Try again shortly.' },
        { status: 429 }
      )
    }
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic().messages.stream({
          model: MODELS.sonnet(),
          max_tokens: 400,
          system: [cachedSystem(DISCOVERY_SYSTEM_PROMPT)],
          messages: parsed.messages.map(({ role, content }) => ({
            role,
            content,
          })),
        })
        for await (const evt of stream) {
          if (
            evt.type === 'content_block_delta' &&
            evt.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(evt.delta.text))
          }
        }
      } catch (err) {
        console.error('Discovery stream error:', err)
        controller.enqueue(
          encoder.encode(
            "Sorry, I hit a snag on my end. Can you send that again?"
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
