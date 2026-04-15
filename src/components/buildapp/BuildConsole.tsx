'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  BuildAppEvent,
  BuildPlan,
  DeployResult,
  GeneratedFile,
} from '@/lib/buildapp/types'

interface Props {
  prompt: string
  email?: string
  onReset: () => void
}

const EASE = [0.16, 1, 0.3, 1] as const

export function BuildConsole({ prompt, email, onReset }: Props) {
  const [plan, setPlan] = useState<BuildPlan | null>(null)
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [files, setFiles] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Set<string>>(new Set())
  const [deploy, setDeploy] = useState<DeployResult | null>(null)
  const [phase, setPhase] = useState<'planning' | 'writing' | 'deploying' | 'ready' | 'error'>(
    'planning'
  )
  const [error, setError] = useState<string>('')
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    const id = setInterval(() => setElapsedMs(Date.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/build-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, email }),
        })
        if (!res.ok || !res.body) {
          const msg = await res.text().catch(() => '')
          setError(`Build failed: ${res.status} ${msg}`)
          setPhase('error')
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
          for (const p of parts) {
            const dataLine = p.split('\n').find((l) => l.startsWith('data: '))
            if (!dataLine) continue
            try {
              const ev = JSON.parse(dataLine.slice(6)) as BuildAppEvent
              handle(ev)
            } catch {
              // ignore malformed
            }
          }
        }
      } catch (err) {
        setError(String(err))
        setPhase('error')
      }
    }

    const handle = (ev: BuildAppEvent) => {
      switch (ev.type) {
        case 'plan':
          setPlan(ev.plan)
          setPhase('writing')
          break
        case 'file.started':
          setActiveFile(ev.path)
          setFiles((f) => ({ ...f, [ev.path]: '' }))
          break
        case 'file.chunk':
          setFiles((f) => ({ ...f, [ev.path]: (f[ev.path] ?? '') + ev.chunk }))
          break
        case 'file.done':
          setFiles((f) => ({ ...f, [ev.file.path]: ev.file.content }))
          setDone((d) => new Set(d).add(ev.file.path))
          break
        case 'deploy.started':
          setPhase('deploying')
          break
        case 'deploy.ready':
          setDeploy(ev.result)
          break
        case 'complete':
          setPhase('ready')
          break
        case 'error':
          setError(ev.error)
          setPhase('error')
          break
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [prompt, email])

  const filePaths = plan?.files ?? Object.keys(files)
  const activeContent = activeFile ? (files[activeFile] ?? '') : ''

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            Build in progress · {Math.floor(elapsedMs / 1000)}s
          </div>
          <h2 className="mt-1 font-serif text-2xl text-warm">
            {plan?.appName ?? 'Compiling a plan…'}
          </h2>
          {plan?.summary && <p className="text-warm/65 text-sm mt-1">{plan.summary}</p>}
        </div>
        <button
          onClick={onReset}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-warm/60 hover:text-cyan-400"
        >
          ← New build
        </button>
      </div>

      <PhaseBar phase={phase} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* File tree + code */}
        <div className="rounded-lg border border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-warm/50">
              claude-opus-4-6 · writing
            </span>
          </div>
          <div className="grid grid-cols-[140px_1fr] min-h-[420px]">
            <ul className="border-r border-white/[0.06] p-3 font-mono text-xs">
              {filePaths.map((p) => (
                <li
                  key={p}
                  onClick={() => setActiveFile(p)}
                  className={`cursor-pointer py-1 ${
                    p === activeFile ? 'text-cyan-400' : 'text-warm/70'
                  } ${done.has(p) ? 'before:content-["✓_"] before:text-green-400' : ''}`}
                >
                  {p}
                </li>
              ))}
              {filePaths.length === 0 && (
                <li className="text-warm/30 text-xs italic">Waiting on plan…</li>
              )}
            </ul>
            <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-warm/85 whitespace-pre-wrap break-words">
              {activeContent || (
                <span className="text-warm/30 italic">Select a file or wait for Claude…</span>
              )}
            </pre>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="rounded-lg border border-white/[0.08] bg-black/40 min-h-[420px]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-warm/50">
              Live preview
            </span>
            {deploy?.url && (
              <a
                href={deploy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
              >
                Open ↗
              </a>
            )}
          </div>
          <AnimatePresence mode="wait">
            {deploy?.url ? (
              <motion.iframe
                key={deploy.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
                src={deploy.url}
                className="h-[600px] w-full rounded-b-lg"
                sandbox="allow-scripts allow-forms allow-same-origin"
                title="Generated app preview"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-warm/40 text-sm">
                {phase === 'deploying' ? 'Deploying…' : 'Preview appears after build.'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  )
}

function PhaseBar({
  phase,
}: {
  phase: 'planning' | 'writing' | 'deploying' | 'ready' | 'error'
}) {
  const steps: { key: typeof phase; label: string }[] = [
    { key: 'planning', label: '01 · Planning' },
    { key: 'writing', label: '02 · Writing files' },
    { key: 'deploying', label: '03 · Deploying' },
    { key: 'ready', label: '04 · Live' },
  ]
  const order: (typeof phase)[] = ['planning', 'writing', 'deploying', 'ready']
  const idx = order.indexOf(phase)
  return (
    <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
      {steps.map((s, i) => (
        <span
          key={s.key}
          className={
            phase === 'error'
              ? 'text-red-400'
              : i < idx
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
