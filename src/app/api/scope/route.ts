import { NextRequest } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { clientEnv } from '@/lib/env'
import { priceScope } from '@/lib/scope/catalog'
import { createScope, attachStripeSession, attachSow } from '@/lib/scope/persist'
import { createSowDocument } from '@/lib/scope/pandadoc'
import { limits, rateKey } from '@/lib/redis'
import { track, EVENTS } from '@/lib/posthog'

export const runtime = 'nodejs'

const InputSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1).max(200),
  lines: z.array(z.object({ id: z.string(), qty: z.number().min(1).max(5) })).min(1),
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

  const { items, totalCents } = priceScope(input.lines)
  if (items.length === 0) {
    return Response.json({ error: 'Empty scope' }, { status: 400 })
  }

  // Bespoke > $75K requires a call — no self-serve path.
  if (totalCents > 75_000_00) {
    return Response.json({
      status: 'oversize',
      message:
        'Scope exceeds $75K — book a call with Charlie to finalize.',
      calendlyUrl: 'https://calendly.com/kianjquinlan/30min',
      totalCents,
    })
  }

  const { id: scopeId, subtotalCents } = await createScope({
    email: input.email,
    companyName: input.companyName,
    lines: input.lines,
  })

  await track(input.email, EVENTS.SCOPE_BUILT, {
    totalCents,
    lineCount: items.length,
    scopeId,
  })

  // Kick off SOW in background (non-blocking for checkout UX)
  let sowUrl: string | null = null
  try {
    const sow = await createSowDocument({
      email: input.email,
      companyName: input.companyName,
      lines: input.lines,
    })
    if (sow && scopeId) {
      await attachSow(scopeId, sow.id)
      sowUrl = sow.viewUrl
    }
  } catch {}

  // Create Stripe Checkout — deposit = 50% of total, rest invoiced at kickoff.
  let checkoutUrl: string | null = null
  try {
    const depositCents = Math.max(2_500_00, Math.round(totalCents * 0.5))
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: input.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Insinuate — ${input.companyName} deposit`,
              description: items
                .map((i) => `${i.line.label} × ${i.qty}`)
                .join('; '),
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/scope/paid?scope=${scopeId ?? 'local'}`,
      cancel_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/scope?cancelled=1`,
      metadata: { scopeId: scopeId ?? '' },
    })
    checkoutUrl = session.url
    if (scopeId && session.id) await attachStripeSession(scopeId, session.id)
    await track(input.email, EVENTS.CHECKOUT_STARTED, { scopeId, totalCents })
  } catch (err) {
    return Response.json(
      {
        status: 'stripe_error',
        error: 'Checkout unavailable — Kian will follow up by email.',
        details: String(err),
        scopeId,
        subtotalCents,
        totalCents,
      },
      { status: 502 }
    )
  }

  return Response.json({
    status: 'ready',
    scopeId,
    totalCents,
    subtotalCents,
    checkoutUrl,
    sowUrl,
  })
}
