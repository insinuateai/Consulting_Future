'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { SwarmAgent, AgentStatus } from '@/lib/dossier/types'

interface Props {
  agent: SwarmAgent
  status: AgentStatus
  thoughts: string
  durationMs?: number
}

const STATUS_DOT: Record<AgentStatus, string> = {
  queued: 'bg-white/20',
  running: 'bg-amber-400 animate-pulse',
  success: 'bg-green-400',
  error: 'bg-rose-500',
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  queued: 'QUEUED',
  running: 'RUNNING',
  success: 'COMPLETE',
  error: 'ERROR',
}

export function AgentTile({ agent, status, thoughts, durationMs }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thoughts])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden rounded-md border
        ${
          status === 'running'
            ? 'border-cyan-400/40 bg-cyan-400/[0.02]'
            : status === 'success'
              ? 'border-green-400/30 bg-white/[0.015]'
              : status === 'error'
                ? 'border-rose-500/40 bg-rose-500/[0.03]'
                : 'border-white/[0.05] bg-white/[0.01]'
        }
        px-3 py-2.5 backdrop-blur-sm
      `}
    >
      {/* Glow when running */}
      {status === 'running' && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-md"
          style={{
            background:
              'radial-gradient(120% 100% at 50% 0%, rgba(0,240,255,0.15), transparent 70%)',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center gap-2">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm/50">
          {STATUS_LABEL[status]}
        </span>
        {durationMs != null && status === 'success' && (
          <span className="ml-auto font-mono text-[10px] text-warm/30">
            {(durationMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      <div className="relative mt-1.5 font-serif text-base leading-tight text-warm">
        {agent.name}
      </div>
      <div className="relative mt-0.5 text-[11px] leading-snug text-warm/45">
        {agent.mission}
      </div>

      {thoughts && (
        <div
          ref={scrollRef}
          className="relative mt-2 max-h-20 overflow-y-auto rounded border border-white/[0.04] bg-black/40 p-1.5 font-mono text-[10px] leading-relaxed text-warm/55"
        >
          {thoughts}
          {status === 'running' && (
            <span className="ml-0.5 inline-block h-2 w-1 animate-pulse bg-cyan-400/70 align-middle" />
          )}
        </div>
      )}
    </motion.div>
  )
}
