import { NextRequest } from 'next/server'
import { z } from 'zod'
import { runBuildApp } from '@/lib/buildapp/orchestrator'
import {
  completeGeneratedApp,
  createGeneratedApp,
  failGeneratedApp,
} from '@/lib/buildapp/persist'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'
import type {
  BuildAppEvent,
  BuildPlan,
  DeployResult,
  GeneratedFile,
} from '@/lib/buildapp/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const InputSchema = z.object({
  prompt: z.string().min(12).max(1500),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof InputSchema>
  try {
    parsed = InputSchema.parse(await req.json())
  } catch (err) {
    return Response.json({ error: 'Invalid input', details: String(err) }, { status: 400 })
  }

  const limiter = limits.buildApp()
  if (limiter) {
    const { success, reset } = await limiter.limit(rateKey(req, parsed.email ?? null))
    if (!success) {
      return Response.json(
        { error: 'Rate limited', message: 'Three apps per day. Try again tomorrow.', resetAt: reset },
        { status: 429 }
      )
    }
  }

  const appId = await createGeneratedApp({ prompt: parsed.prompt, email: parsed.email ?? null })
  if (!appId) {
    return Response.json({ error: 'Could not create app row' }, { status: 500 })
  }

  if (parsed.email) {
    await track(parsed.email, EVENTS.APP_GENERATED, {
      appId,
      promptLen: parsed.prompt.length,
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: BuildAppEvent) => {
        controller.enqueue(
          encoder.encode(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
        )
      }
      let plan: BuildPlan | null = null
      let files: GeneratedFile[] = []
      let deploy: DeployResult | null = null
      try {
        for await (const ev of runBuildApp(appId, parsed)) {
          send(ev)
          if (ev.type === 'plan') plan = ev.plan
          if (ev.type === 'file.done') files.push(ev.file)
          if (ev.type === 'deploy.ready') deploy = ev.result
          if (ev.type === 'complete') {
            files = ev.files
            deploy = ev.deploy
          }
          if (ev.type === 'error') {
            await failGeneratedApp(appId, ev.error)
          }
        }
        if (plan && deploy && files.length > 0) {
          await completeGeneratedApp({
            appId,
            plan,
            files,
            deployUrl: deploy.url,
            repoUrl: deploy.repoUrl,
          })
        }
      } catch (err) {
        const msg = String(err)
        await failGeneratedApp(appId, msg)
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
