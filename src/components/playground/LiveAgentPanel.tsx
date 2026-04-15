'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentSlug } from '@/lib/agents/prompts'

interface Props {
  slug: AgentSlug
  placeholder: string
  exampleLabel?: string
  example?: string
  title?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

export function LiveAgentPanel({ slug, placeholder, exampleLabel, example, title }: Props) {
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<unknown>(null)
  const [meta, setMeta] = useState<{ model: string; durationMs: number } | null>(null)
  const [error, setError] = useState<string>('')
  const [email, setEmail] = useState('')

  const run = async () => {
    setRunning(true)
    setOutput(null)
    setError('')
    setMeta(null)
    try {
      const res = await fetch(`/api/agents/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, email: email || undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Request failed: ${res.status}`)
        return
      }
      setOutput(json.output)
      setMeta({ model: json.model, durationMs: json.durationMs })
    } catch (err) {
      setError(String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="glass-panel-strong p-6 rounded-lg border border-cyan/20">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
            Run on your data · live
          </div>
          <h3 className="mt-1 font-display text-xl text-warm">
            {title ?? 'Paste real input — watch Claude run it.'}
          </h3>
        </div>
        {example && (
          <button
            onClick={() => setInput(example)}
            className="font-mono text-[10px] uppercase tracking-widest text-warm/60 hover:text-cyan"
          >
            {exampleLabel ?? 'Load example →'}
          </button>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={6}
        maxLength={8000}
        className="mt-4 w-full rounded border border-white/[0.08] bg-black/40 p-3 font-mono text-xs text-warm placeholder:text-warm/30 focus:border-cyan focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email (optional, unlocks rate limit)"
          className="flex-1 min-w-[220px] rounded border border-white/[0.08] bg-black/40 p-2 font-mono text-xs text-warm placeholder:text-warm/30 focus:border-cyan focus:outline-none"
        />
        <button
          onClick={run}
          disabled={running || input.trim().length < 4}
          className="bg-cyan text-deep font-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_28px_rgba(0,240,255,0.38)] disabled:opacity-40"
        >
          {running ? 'Running…' : 'Run agent'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {output !== null && (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-5 rounded border border-white/[0.08] bg-black/30 p-4"
          >
            {meta && (
              <div className="mb-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-warm/50">
                <span>model · {meta.model}</span>
                <span>·</span>
                <span>{meta.durationMs} ms</span>
              </div>
            )}
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-warm/85">
              {JSON.stringify(output, null, 2)}
            </pre>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 rounded border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-200"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
