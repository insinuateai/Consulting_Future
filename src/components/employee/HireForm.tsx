'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

const EXAMPLES = [
  'Read my support@ inbox every 15 minutes, triage new emails by topic, and draft replies using our help center. Don\'t send — just draft.',
  'Each morning, summarize the top 10 competitor changelogs from the last 24h and post a Slack digest.',
  'Watch our Shopify orders for anomalies (refund spikes, SKU margin drops) and email me when something deviates > 2 sigma.',
]

interface Persona {
  name: string
  title: string
  intro: string
}

export function HireForm() {
  const [email, setEmail] = useState('')
  const [taskBrief, setTaskBrief] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Persona | null>(null)
  const [error, setError] = useState<string>('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || taskBrief.trim().length < 20 || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/employee/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, taskBrief: taskBrief.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Hire failed')
      } else {
        setResult(data.persona as Persona)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="rounded-xl border border-cyan-400/40 bg-cyan-400/[0.04] p-8"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
          Hired · Day 1
        </div>
        <h2 className="mt-2 font-serif text-3xl text-warm">
          Meet {result.name} — {result.title}
        </h2>
        <div className="mt-5 whitespace-pre-wrap text-warm/80">{result.intro}</div>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-warm/50">
          Intro email sent. 7-day trial. Reply to tune the task.
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="hire-task"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400"
        >
          What recurring task should they own?
        </label>
        <textarea
          id="hire-task"
          value={taskBrief}
          onChange={(e) => setTaskBrief(e.target.value)}
          placeholder="Describe one repetitive task…"
          rows={5}
          minLength={20}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
        />
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-warm/40">
          <span>Be specific — inputs, schedule, output format</span>
          <span>{taskBrief.length}/2000</span>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="hire-email"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm/60"
        >
          Your email (where they&apos;ll work from)
        </label>
        <input
          id="hire-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting || !email || taskBrief.trim().length < 20}
          className="rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Onboarding…' : '▸ Hire them — 7 day free trial'}
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-warm/40">
          Free 7 days · $499/mo after · cancel anytime
        </span>
      </div>

      {error && (
        <div className="rounded border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="border-t border-white/[0.05] pt-6">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-warm/40">
          Need ideas?
        </div>
        <div className="grid grid-cols-1 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setTaskBrief(ex)}
              className="rounded border border-white/[0.06] bg-white/[0.02] p-3 text-left text-xs text-warm/70 transition hover:border-cyan-400/40 hover:text-warm"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </motion.form>
  )
}
