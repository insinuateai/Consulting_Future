'use client'

import { motion } from 'framer-motion'
import { personaByRole } from '@/lib/boardroom/personas'
import type { ExecRole } from '@/lib/boardroom/types'

export type ExecState = 'idle' | 'thinking' | 'speaking' | 'done' | 'error'

const ROLE_COLOR: Record<ExecRole, string> = {
  cfo: 'from-green-400/60 to-emerald-600/10 border-green-400/40',
  cmo: 'from-fuchsia-400/60 to-pink-600/10 border-fuchsia-400/40',
  cto: 'from-cyan-400/60 to-sky-600/10 border-cyan-400/40',
  coo: 'from-amber-400/60 to-orange-600/10 border-amber-400/40',
}

export function ExecPanel({
  role,
  state,
  opening,
  rebuttal,
  phase,
}: {
  role: ExecRole
  state: ExecState
  opening: string
  rebuttal: string
  phase: 'opening' | 'debate' | 'vote' | 'idle'
}) {
  const p = personaByRole(role)
  const showRebuttal = phase === 'debate' || phase === 'vote'

  return (
    <div
      className={`relative rounded-lg border bg-gradient-to-b ${ROLE_COLOR[role]} bg-black/30 p-5 backdrop-blur-sm`}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-warm/60">
            {p.role.toUpperCase()}
          </div>
          <div className="mt-1 font-serif text-lg text-warm">{p.name}</div>
          <div className="text-[11px] text-warm/50">{p.title}</div>
        </div>
        <StateBadge state={state} />
      </div>

      <div className="mt-4 max-h-[340px] overflow-y-auto">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-warm/40">
          Opening
        </div>
        <motion.p
          className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-warm/90"
          key={`opening-${opening.length}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
        >
          {opening || <span className="text-warm/30">Waiting…</span>}
        </motion.p>

        {showRebuttal && (
          <>
            <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-warm/40">
              Rebuttal
            </div>
            <motion.p
              className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-warm/90"
              key={`rebuttal-${rebuttal.length}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
            >
              {rebuttal || <span className="text-warm/30">Waiting…</span>}
            </motion.p>
          </>
        )}
      </div>
    </div>
  )
}

function StateBadge({ state }: { state: ExecState }) {
  const map: Record<ExecState, { label: string; color: string }> = {
    idle: { label: 'Idle', color: 'text-warm/40' },
    thinking: { label: 'Thinking…', color: 'text-amber-400' },
    speaking: { label: 'Speaking', color: 'text-cyan-400' },
    done: { label: 'Done', color: 'text-green-400' },
    error: { label: 'Error', color: 'text-red-400' },
  }
  const m = map[state]
  return (
    <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${m.color}`}>
      ● {m.label}
    </div>
  )
}
