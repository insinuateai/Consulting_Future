import { NextRequest } from 'next/server'
import { z } from 'zod'
import { kickoffPersonalizedVideo } from '@/lib/video/render'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  companyName: z.string().min(1).max(200),
  domain: z.string().min(3).max(200),
  industry: z.string().optional(),
  highlights: z.array(z.string()).max(6).optional(),
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let input: z.infer<typeof InputSchema>
  try {
    input = InputSchema.parse(await req.json())
  } catch (err) {
    return Response.json({ error: 'Invalid input', details: String(err) }, { status: 400 })
  }

  const limiter = limits.dossier()
  if (limiter) {
    const { success, reset } = await limiter.limit(
      rateKey(req, input.recipientEmail)
    )
    if (!success) {
      return Response.json(
        { error: 'Rate limited', resetAt: reset },
        { status: 429 }
      )
    }
  }

  try {
    const result = await kickoffPersonalizedVideo(input)
    await track(input.recipientEmail, EVENTS.VIDEO_QUEUED, {
      companyName: input.companyName,
      status: result.status,
      provider: result.provider,
    })
    return Response.json(result)
  } catch (err) {
    return Response.json(
      { error: 'Video kickoff failed', details: String(err) },
      { status: 500 }
    )
  }
}
