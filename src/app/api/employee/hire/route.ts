import { NextRequest } from 'next/server'
import { z } from 'zod'
import { generatePersona } from '@/lib/employee/persona'
import { createDigitalEmployee } from '@/lib/employee/persist'
import { sendEmail } from '@/lib/resend'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'
import { serverEnv } from '@/lib/env'

export const runtime = 'nodejs'
export const maxDuration = 60

const InputSchema = z.object({
  email: z.string().email(),
  taskBrief: z.string().min(20).max(2000),
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
    const { success } = await limiter.limit(rateKey(req, input.email))
    if (!success) {
      return Response.json({ error: 'Rate limited' }, { status: 429 })
    }
  }

  let persona
  try {
    persona = await generatePersona(input.taskBrief)
  } catch (err) {
    return Response.json({ error: 'Persona generation failed', details: String(err) }, { status: 502 })
  }

  const { id } = await createDigitalEmployee({
    email: input.email,
    persona,
    taskBrief: input.taskBrief,
  })

  await track(input.email, EVENTS.DIGITAL_EMPLOYEE_TRIAL, {
    employeeId: id,
    role: persona.title,
  })

  // Send the "Day 1" intro email from the persona — if Resend isn't keyed,
  // we silently skip so the feature still returns success in dev.
  if (serverEnv.RESEND_API_KEY) {
    try {
      await sendEmail({
        to: input.email,
        subject: `Hi — I'm ${persona.name}, your new ${persona.title}`,
        text: `${persona.intro}\n\n— ${persona.name}\nHired via Insinuate — 7-day trial`,
      })
    } catch {
      // email failure non-fatal; the employee is still created
    }
  }

  return Response.json({
    status: 'hired',
    employeeId: id,
    persona,
    trialDays: 7,
  })
}
