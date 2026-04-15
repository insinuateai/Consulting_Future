'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import type { DigitalTwin } from '@/lib/twin/types'

const TwinScene = dynamic(() => import('./TwinScene').then((m) => m.TwinScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-lg border border-white/[0.08] bg-black/60 text-warm/40">
      Loading scene…
    </div>
  ),
})

const EASE = [0.16, 1, 0.3, 1] as const

export function TwinViewer() {
  const [companyName, setCompanyName] = useState('')
  const [domain, setDomain] = useState('')
  const [twin, setTwin] = useState<DigitalTwin | null>(null)
  const [mode, setMode] = useState<'current' | 'future'>('current')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !domain) return
    setLoading(true)
    setErr('')
    setTwin(null)
    try {
      const res = await fetch('/api/twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, domain }),
      })
      const data = await res.json()
      if (!res.ok) setErr(data.error ?? 'Twin failed')
      else setTwin(data as DigitalTwin)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.form
        onSubmit={run}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-white/[0.08] bg-black/40 p-4"
      >
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
            Company
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            className="rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
          />
        </div>
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
            Domain
          </label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.com"
            className="rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !companyName || !domain}
          className="rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-40"
        >
          {loading ? 'Modeling…' : '▸ Model twin'}
        </button>
      </motion.form>

      {err && (
        <div className="rounded border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {err}
        </div>
      )}

      {twin && (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-warm">{twin.companyName} — digital twin</h2>
            <div className="flex overflow-hidden rounded border border-white/[0.08]">
              <button
                onClick={() => setMode('current')}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${
                  mode === 'current'
                    ? 'bg-red-400/20 text-red-300'
                    : 'text-warm/50 hover:text-warm'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setMode('future')}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${
                  mode === 'future'
                    ? 'bg-green-400/15 text-green-300'
                    : 'text-warm/50 hover:text-warm'
                }`}
              >
                Future (AI-enhanced)
              </button>
            </div>
          </div>

          <TwinScene twin={twin} mode={mode} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-red-400/30 bg-red-400/[0.04] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-300">
                Current state
              </div>
              <p className="mt-2 text-sm text-warm/80">{twin.currentStateSummary}</p>
            </div>
            <div className="rounded-lg border border-green-400/30 bg-green-400/[0.04] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-green-300">
                Future state
              </div>
              <p className="mt-2 text-sm text-warm/80">{twin.futureStateSummary}</p>
            </div>
          </div>

          {twin.roi?.length > 0 && (
            <div className="rounded-lg border border-white/[0.08] bg-black/40 p-4">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
                Annual impact
              </div>
              <ul className="space-y-2">
                {twin.roi.map((r, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-warm/70">{r.label}</span>
                    <span className="font-mono text-warm/90">
                      <span className="text-red-300">${(r.currentUsd / 1000).toFixed(0)}K</span>
                      {' → '}
                      <span className="text-green-300">${(r.futureUsd / 1000).toFixed(0)}K</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
