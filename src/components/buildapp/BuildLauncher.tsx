'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BuildConsole } from './BuildConsole'

const EASE = [0.16, 1, 0.3, 1] as const

const EXAMPLES = [
  'A dashboard that tracks Shopify orders by SKU margin with color-coded alerts.',
  'A lead-scoring playground that ranks 10 sample leads by ICP fit with rationale.',
  'A churn-risk signal board for a SaaS — cards for each account with risk score.',
  'A competitor pricing radar that compares 4 brands on a grid with delta arrows.',
]

export function BuildLauncher() {
  const [prompt, setPrompt] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState<{ prompt: string; email?: string } | null>(null)

  if (submitted) {
    return (
      <BuildConsole
        prompt={submitted.prompt}
        email={submitted.email}
        onReset={() => setSubmitted(null)}
      />
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = prompt.trim()
    if (trimmed.length < 12) return
    setSubmitted({ prompt: trimmed, email: email.trim() || undefined })
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="build-prompt"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400"
        >
          Describe the app
        </label>
        <textarea
          id="build-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A dashboard that tracks my Shopify orders by SKU margin…"
          rows={4}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
          minLength={12}
          maxLength={1500}
          required
        />
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-warm/40">
          <span>Claude opus 4.6 · 90–120s build time</span>
          <span>{prompt.length}/1500</span>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="build-email"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm/60"
        >
          Email (optional · we&apos;ll send the live URL + repo)
        </label>
        <input
          id="build-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={prompt.trim().length < 12}
          className="rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ▸ Build it now
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-warm/40">
          3 builds / day / email · no credit card
        </span>
      </div>

      <div className="border-t border-white/[0.05] pt-6">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-warm/40">
          Or try one of these
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
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
