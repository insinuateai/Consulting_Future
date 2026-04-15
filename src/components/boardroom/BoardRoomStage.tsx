'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ExecPanel, type ExecState } from './ExecPanel'
import type { BoardRoomEvent, ExecRole, Vote } from '@/lib/boardroom/types'

type Phase = 'idle' | 'opening' | 'debate' | 'vote' | 'complete'

interface Props {
  topic: string
  context?: string
  dossierSlug?: string
  email?: string
  onComplete?: () => void
}

const ROLES: ExecRole[] = ['cfo', 'cmo', 'cto', 'coo']

export function BoardRoomStage({ topic, context, dossierSlug, email, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [states, setStates] = useState<Record<ExecRole, ExecState>>({
    cfo: 'idle',
    cmo: 'idle',
    cto: 'idle',
    coo: 'idle',
  })
  const [openings, setOpenings] = useState<Record<ExecRole, string>>({
    cfo: '',
    cmo: '',
    cto: '',
    coo: '',
  })
  const [rebuttals, setRebuttals] = useState<Record<ExecRole, string>>({
    cfo: '',
    cmo: '',
    cto: '',
    coo: '',
  })
  const [votes, setVotes] = useState<Vote[] | null>(null)
  const [winner, setWinner] = useState<string>('')
  const [error, setError] = useState<string>('')

  const phaseRef = useRef<Phase>('idle')
  phaseRef.current = phase

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/boardroom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, context, dossierSlug, email }),
        })
        if (!res.ok || !res.body) {
          setError(`Board room request failed: ${res.status}`)
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        while (!cancelled) {
          const { value, done } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split('\n\n')
          buf = parts.pop() ?? ''
          for (const part of parts) {
            const dataLine = part.split('\n').find((l) => l.startsWith('data: '))
            if (!dataLine) continue
            try {
              const ev = JSON.parse(dataLine.slice(6)) as BoardRoomEvent
              handleEvent(ev)
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch (err) {
        setError(String(err))
      }
    }

    const handleEvent = (ev: BoardRoomEvent) => {
      switch (ev.type) {
        case 'started':
          setPhase('opening')
          break
        case 'phase':
          setPhase(ev.phase)
          break
        case 'exec.thinking':
          setStates((s) => ({ ...s, [ev.role]: 'thinking' }))
          break
        case 'exec.chunk': {
          setStates((s) => ({ ...s, [ev.role]: 'speaking' }))
          const setter = phaseRef.current === 'debate' ? setRebuttals : setOpenings
          setter((o) => ({ ...o, [ev.role]: (o[ev.role] ?? '') + ev.chunk }))
          break
        }
        case 'exec.done': {
          setStates((s) => ({ ...s, [ev.role]: 'done' }))
          const setter = phaseRef.current === 'debate' ? setRebuttals : setOpenings
          setter((o) => ({ ...o, [ev.role]: ev.text }))
          break
        }
        case 'exec.error':
          setStates((s) => ({ ...s, [ev.role]: 'error' }))
          break
        case 'vote':
          setVotes(ev.votes)
          setWinner(ev.winner)
          break
        case 'complete':
          setPhase('complete')
          onComplete?.()
          break
        case 'error':
          setError(ev.error)
          break
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [topic, context, dossierSlug, email, onComplete])

  return (
    <div className="space-y-8">
      <PhaseBar phase={phase} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((r) => (
          <ExecPanel
            key={r}
            role={r}
            state={states[r]}
            opening={openings[r]}
            rebuttal={rebuttals[r]}
            phase={phase === 'idle' ? 'idle' : phase === 'complete' ? 'vote' : phase}
          />
        ))}
      </div>

      {votes && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-lg border border-cyan-400/30 bg-cyan-400/[0.04] p-6"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            The Board Has Voted
          </div>
          <h3 className="mt-2 font-serif text-2xl text-warm">{winner}</h3>
          <ul className="mt-4 space-y-2 text-sm text-warm/80">
            {votes.map((v) => (
              <li key={v.role}>
                <span className="font-mono uppercase tracking-widest text-warm/50">
                  {v.role} · {v.confidence}
                </span>{' '}
                — {v.recommendation}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {error && (
        <div className="rounded border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  )
}

function PhaseBar({ phase }: { phase: Phase }) {
  const steps: { key: Phase; label: string }[] = [
    { key: 'opening', label: '01 · Opening takes' },
    { key: 'debate', label: '02 · Debate' },
    { key: 'vote', label: '03 · Vote' },
    { key: 'complete', label: '04 · Verdict' },
  ]
  const order: Phase[] = ['idle', 'opening', 'debate', 'vote', 'complete']
  const idx = order.indexOf(phase)
  return (
    <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
      {steps.map((s, i) => (
        <span
          key={s.key}
          className={
            i < idx
              ? 'text-green-400'
              : i === idx
                ? 'text-cyan-400'
                : 'text-warm/30'
          }
        >
          {s.label}
        </span>
      ))}
    </div>
  )
}
