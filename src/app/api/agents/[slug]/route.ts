import { NextRequest } from 'next/server'
import { z } from 'zod'
import { complete, MODELS, extractJson } from '@/lib/llm'
import { AGENT_SPECS, type AgentSlug } from '@/lib/agents/prompts'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  input: z.string().min(4).max(8000),
  email: z.string().email().optional(),
})

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params
  if (!(slug in AGENT_SPECS)) {
    return Response.json({ error: 'Unknown agent' }, { status: 404 })
  }
  const agent = AGENT_SPECS[slug as AgentSlug]

  let parsed: z.infer<typeof InputSchema>
  try {
    parsed = InputSchema.parse(await req.json())
  } catch (err) {
    return Response.json({ error: 'Invalid input', details: String(err) }, { status: 400 })
  }

  const limiter = limits.playgroundAgent()
  if (limiter) {
    const { success, reset } = await limiter.limit(rateKey(req, parsed.email ?? null))
    if (!success) {
      return Response.json({ error: 'Rate limited', resetAt: reset }, { status: 429 })
    }
  }

  const model =
    agent.model === 'haiku'
      ? MODELS.haiku()
      : agent.model === 'opus'
        ? MODELS.opus()
        : MODELS.sonnet()

  const started = Date.now()
  try {
    const text = await complete({
      model,
      maxTokens: agent.maxTokens,
      system: agent.systemBlocks,
      messages: [{ role: 'user', content: agent.userPrompt(parsed.input) }],
    })
    const parsedOutput = extractJson(text)
    const durationMs = Date.now() - started

    if (parsed.email) {
      await track(parsed.email, EVENTS.PLAYGROUND_AGENT_RUN, {
        agent: slug,
        durationMs,
        model,
      })
    }

    return Response.json({
      ok: true,
      agent: slug,
      model,
      durationMs,
      output: parsedOutput ?? { raw: text },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
