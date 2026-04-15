'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AgentSwarm, emptySwarmState, type SwarmState } from './AgentSwarm'
import type { DossierEvent } from '@/lib/dossier/types'

type Phase = 'form' | 'streaming' | 'done' | 'error'

export function DossierLauncher() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [error, setError] = useState<string | null>(null)
  const [swarm, setSwarm] = useState<SwarmState>(emptySwarmState())
  const [completedSlug, setCompletedSlug] = useState<string | null>(null)
  const [form, setForm] = useState({
    url: '',
    email: '',
    area: '',
    hours: '',
    team: '',
  })

  async function start(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPhase('streaming')
    setSwarm({ ...emptySwarmState(), phase: 'intel' })

    let normalizedUrl = form.url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    try {
      const res = await fetch('/api/dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, url: normalizedUrl }),
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const block of parts) {
          const dataLine = block.split('\n').find((l) => l.startsWith('data: '))
          if (!dataLine) continue
          try {
            const ev: DossierEvent = JSON.parse(dataLine.slice(6))
            applyEvent(ev)
          } catch {
            // ignore malformed
          }
        }
      }
    } catch (err) {
      setError(String((err as Error).message ?? err))
      setPhase('error')
    }
  }

  function applyEvent(ev: DossierEvent) {
    setSwarm((s) => {
      const next: SwarmState = {
        ...s,
        status: { ...s.status },
        thoughts: { ...s.thoughts },
        durations: { ...s.durations },
      }
      switch (ev.type) {
        case 'phase':
          next.phase = ev.phase
          break
        case 'agent.running':
          next.status[ev.slug] = 'running'
          break
        case 'agent.thought':
          next.thoughts[ev.slug] =
            (next.thoughts[ev.slug] ?? '') + ev.chunk
          break
        case 'agent.done':
          next.status[ev.slug] = 'success'
          next.durations[ev.slug] = ev.durationMs
          break
        case 'agent.error':
          next.status[ev.slug] = 'error'
          break
        case 'complete':
          next.phase = 'complete'
          setCompletedSlug(ev.dossier.slug)
          setPhase('done')
          break
        case 'error':
          setError(ev.error)
          setPhase('error')
          break
      }
      return next
    })
  }

  if (phase === 'form') {
    return (
      <motion.form
        onSubmit={start}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-2xl rounded-lg border border-white/[0.05] bg-white/[0.015] p-8 backdrop-blur-xl"
      >
        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">
          THE DOSSIER · 90 SECONDS · FREE
        </div>
        <h3 className="font-serif text-3xl leading-tight text-warm">
          A 10-page strategic brief for your business — written live by 20 AI
          agents working in parallel.
        </h3>

        <div className="mt-8 grid gap-4">
          <Input
            label="Your website"
            placeholder="acme.com"
            value={form.url}
            onChange={(v) => setForm({ ...form, url: v })}
            required
          />
          <Input
            label="Your email"
            type="email"
            placeholder="you@acme.com"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Input
            label="Where is most of your team's time being lost right now?"
            placeholder="Customer support, invoice processing, lead qualification…"
            value={form.area}
            onChange={(v) => setForm({ ...form, area: v })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours / week on it"
              placeholder="40"
              value={form.hours}
              onChange={(v) => setForm({ ...form, hours: v })}
              required
            />
            <Input
              label="Team size"
              placeholder="5"
              value={form.team}
              onChange={(v) => setForm({ ...form, team: v })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded bg-cyan-400 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300"
        >
          Generate my dossier →
        </button>
        <p className="mt-4 text-center text-[11px] text-warm/40">
          Powered by Claude. Your dossier and a sharable link will be emailed in 90 seconds.
        </p>
      </motion.form>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400">
            DOSSIER · IN PROGRESS
          </div>
          <h3 className="mt-2 font-serif text-2xl text-warm">
            20 agents working in parallel on{' '}
            <span className="text-cyan-400">{form.url || 'your business'}</span>
          </h3>
        </div>
        {phase === 'done' && completedSlug && (
          <button
            onClick={() => router.push(`/dossier/${completedSlug}`)}
            className="rounded bg-cyan-400 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300"
          >
            Open dossier →
          </button>
        )}
      </div>

      <AgentSwarm state={swarm} />

      {phase === 'error' && error && (
        <div className="rounded border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}
    </motion.div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-warm/50">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded border border-white/[0.08] bg-black/40 px-4 py-3 text-warm placeholder:text-warm/25 focus:border-cyan-400/60 focus:outline-none"
      />
    </label>
  )
}
