'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SWARM_AGENTS } from '@/lib/dossier/agents'
import { AgentTile } from './AgentTile'
import type { AgentStatus } from '@/lib/dossier/types'

export interface SwarmState {
  status: Record<string, AgentStatus>
  thoughts: Record<string, string>
  durations: Record<string, number>
  phase: 'idle' | 'intel' | 'analysis' | 'strategy' | 'output' | 'complete'
}

const LANES = [
  { key: 'intel', label: '01 · INTEL', sub: 'Recon' },
  { key: 'analysis', label: '02 · ANALYSIS', sub: 'Synthesis' },
  { key: 'strategy', label: '03 · STRATEGY', sub: 'Proposals' },
  { key: 'output', label: '04 · OUTPUT', sub: 'Final dossier' },
] as const

export function AgentSwarm({ state }: { state: SwarmState }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {LANES.map((lane) => {
        const active = state.phase === lane.key
        const past =
          ['intel', 'analysis', 'strategy', 'output'].indexOf(state.phase) >
          ['intel', 'analysis', 'strategy', 'output'].indexOf(lane.key)
        return (
          <div key={lane.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <div>
                <div
                  className={`font-mono text-[10px] tracking-[0.2em] ${
                    active
                      ? 'text-cyan-400'
                      : past
                        ? 'text-green-400/70'
                        : 'text-warm/30'
                  }`}
                >
                  {lane.label}
                </div>
                <div className="text-[11px] text-warm/40">{lane.sub}</div>
              </div>
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="font-mono text-[9px] text-cyan-400"
                  >
                    ● LIVE
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col gap-2">
              {SWARM_AGENTS.filter((a) => a.lane === lane.key).map((agent) => (
                <AgentTile
                  key={agent.slug}
                  agent={agent}
                  status={state.status[agent.slug] ?? 'queued'}
                  thoughts={state.thoughts[agent.slug] ?? ''}
                  durationMs={state.durations[agent.slug]}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function emptySwarmState(): SwarmState {
  const status: Record<string, AgentStatus> = {}
  for (const a of SWARM_AGENTS) status[a.slug] = 'queued'
  return { status, thoughts: {}, durations: {}, phase: 'idle' }
}
