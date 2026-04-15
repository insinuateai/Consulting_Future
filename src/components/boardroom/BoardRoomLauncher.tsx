'use client'

import { useState } from 'react'
import { BoardRoomStage } from './BoardRoomStage'

interface Props {
  defaultDossierSlug?: string
  defaultTopic?: string
}

export function BoardRoomLauncher({ defaultDossierSlug, defaultTopic }: Props) {
  const [topic, setTopic] = useState(defaultTopic ?? '')
  const [context, setContext] = useState('')
  const [dossierSlug, setDossierSlug] = useState(defaultDossierSlug ?? '')
  const [email, setEmail] = useState('')
  const [running, setRunning] = useState(false)
  const [runKey, setRunKey] = useState(0)

  if (running) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              Board in session · topic
            </div>
            <h2 className="mt-1 font-serif text-2xl text-warm">{topic}</h2>
          </div>
          <button
            onClick={() => setRunning(false)}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-warm/60 hover:text-cyan-400"
          >
            ← New topic
          </button>
        </div>
        <BoardRoomStage
          key={runKey}
          topic={topic}
          context={context || undefined}
          dossierSlug={dossierSlug || undefined}
          email={email || undefined}
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (topic.length < 4) return
        setRunKey((k) => k + 1)
        setRunning(true)
      }}
      className="space-y-6 rounded-lg border border-white/[0.08] bg-white/[0.02] p-8"
    >
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
          Topic — what should the board debate?
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Should we automate our SDR team or our procurement team first?"
          rows={2}
          required
          minLength={4}
          maxLength={500}
          className="mt-3 w-full rounded border border-white/[0.08] bg-black/40 p-4 font-serif text-lg text-warm placeholder:text-warm/30 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
            Dossier slug (optional)
          </label>
          <input
            value={dossierSlug}
            onChange={(e) => setDossierSlug(e.target.value)}
            placeholder="e.g. acme-com-abc123"
            className="mt-3 w-full rounded border border-white/[0.08] bg-black/40 p-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
            Email (optional — unlocks rate limit)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-3 w-full rounded border border-white/[0.08] bg-black/40 p-3 font-mono text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-warm/50">
          Constraints or founder note (optional)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Budget cap $100k this year; cannot touch finance system until Q3."
          rows={2}
          maxLength={1000}
          className="mt-3 w-full rounded border border-white/[0.08] bg-black/40 p-3 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={topic.length < 4}
        className="rounded bg-cyan-400 px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300 disabled:opacity-40"
      >
        Call the board to session →
      </button>
    </form>
  )
}
