import { NextRequest } from 'next/server'
import { z } from 'zod'
import { generateTwin } from '@/lib/twin/generate'
import { limits, rateKey } from '@/lib/redis'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  companyName: z.string().min(1).max(200),
  domain: z.string().min(3).max(200),
  industry: z.string().optional(),
  summary: z.string().optional(),
  opportunities: z.array(z.string()).max(6).optional(),
  email: z.string().email().optional(),
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
    const { success } = await limiter.limit(rateKey(req, input.email ?? null))
    if (!success) return Response.json({ error: 'Rate limited' }, { status: 429 })
  }
  try {
    const twin = await generateTwin(input)
    return Response.json(twin)
  } catch (err) {
    return Response.json({ error: 'Twin generation failed', details: String(err) }, { status: 500 })
  }
}
