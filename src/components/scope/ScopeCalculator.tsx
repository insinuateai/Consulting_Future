'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CATALOG, ICP_PRESETS, priceScope, type IcpPreset, type ScopeLine } from '@/lib/scope/catalog'

const EASE = [0.16, 1, 0.3, 1] as const
const fmt = (c: number) => `$${Math.round(c / 100).toLocaleString()}`

export function ScopeCalculator() {
  const [lines, setLines] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const c of CATALOG) init[c.id] = c.defaultQty
    return init
  })
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<
    | null
    | {
        status: string
        totalCents?: number
        checkoutUrl?: string | null
        sowUrl?: string | null
        message?: string
      }
  >(null)

  const scopeLines: ScopeLine[] = Object.entries(lines)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, qty }))

  const pricing = useMemo(() => priceScope(scopeLines), [scopeLines])

  const applyPreset = (p: IcpPreset) => {
    const preset = ICP_PRESETS[p]
    const next: Record<string, number> = {}
    for (const c of CATALOG) next[c.id] = 0
    for (const it of preset.items) next[it.id] = it.qty
    setLines(next)
  }

  const increment = (id: string, delta: number) => {
    setLines((l) => {
      const item = CATALOG.find((c) => c.id === id)
      if (!item) return l
      const next = Math.max(0, Math.min(item.maxQty, (l[id] ?? 0) + delta))
      return { ...l, [id]: next }
    })
  }

  const submit = async () => {
    if (!email || !companyName || pricing.items.length === 0) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, lines: scopeLines }),
      })
      const data = await res.json()
      setResult(data)
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch (err) {
      setResult({ status: 'error', message: String(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
      {/* Left: item catalog */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="space-y-6"
      >
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
            Start from a preset
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ICP_PRESETS) as IcpPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className="rounded border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-warm/70 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                {ICP_PRESETS[p].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {CATALOG.map((c) => {
            const qty = lines[c.id] ?? 0
            const active = qty > 0
            return (
              <div
                key={c.id}
                className={`rounded-lg border p-4 transition ${
                  active
                    ? 'border-cyan-400/40 bg-cyan-400/[0.04]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-lg text-warm">{c.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-warm/40">
                        {c.timelineDays}d
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-warm/65">{c.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm text-warm/80">
                      {fmt(c.priceCents)}
                    </span>
                    <div className="flex items-center overflow-hidden rounded border border-white/[0.1]">
                      <button
                        onClick={() => increment(c.id, -1)}
                        disabled={qty === 0}
                        className="px-3 py-1 font-mono text-sm text-warm/70 hover:bg-white/[0.05] disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono text-sm text-warm">
                        {qty}
                      </span>
                      <button
                        onClick={() => increment(c.id, 1)}
                        disabled={qty >= c.maxQty}
                        className="px-3 py-1 font-mono text-sm text-warm/70 hover:bg-white/[0.05] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Right: sticky summary */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="h-fit rounded-lg border border-white/[0.08] bg-black/50 p-6 lg:sticky lg:top-24"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
          Your scope
        </div>
        <div className="mt-1 font-serif text-3xl text-warm">
          {fmt(pricing.totalCents)}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-warm/40">
          {pricing.timelineDays > 0 ? `Ships in ≤ ${pricing.timelineDays} days` : 'Pick at least one item'}
        </div>

        <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-5 text-sm">
          {pricing.items.length === 0 ? (
            <li className="text-warm/40 italic">No items selected.</li>
          ) : (
            pricing.items.map((i) => (
              <li key={i.line.id} className="flex justify-between gap-3">
                <span className="text-warm/80">
                  {i.line.label} {i.qty > 1 && <span className="text-warm/50">× {i.qty}</span>}
                </span>
                <span className="font-mono text-warm/70">
                  {fmt(i.subtotalCents)}
                </span>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className="w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={
              submitting ||
              !email ||
              !companyName ||
              pricing.items.length === 0
            }
            className="w-full rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Preparing…' : '▸ Pay 50% deposit · kick off'}
          </button>
          <p className="font-mono text-[9px] uppercase tracking-widest text-warm/40">
            50% now, 50% on delivery. No NDAs. No sales calls under $75K.
          </p>
        </div>

        {result?.status === 'oversize' && (
          <div className="mt-4 rounded border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-warm/80">
            {result.message}{' '}
            <a
              className="text-cyan-300 hover:underline"
              href="https://calendly.com/kianjquinlan/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book →
            </a>
          </div>
        )}
        {result?.status === 'stripe_error' && (
          <div className="mt-4 rounded border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
            {result.message ?? 'Stripe not ready. Kian will follow up.'}
          </div>
        )}
      </motion.aside>
    </div>
  )
}
