'use client'

import { AGENTS, type AgentId } from '@/lib/playgroundAgents'
import { useSoundContext } from '@/lib/SoundContext'

export function AgentSelector({
  active,
  onChange,
}: {
  active: AgentId
  onChange: (id: AgentId) => void
}) {
  const { playEffect } = useSoundContext()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="tablist" aria-label="Playground agents">
      {AGENTS.map((agent) => {
        const isActive = agent.id === active
        return (
          <button
            key={agent.id}
            role="tab"
            aria-selected={isActive}
            onMouseEnter={() => playEffect('hover')}
            onClick={() => {
              if (!isActive) {
                playEffect('click')
                onChange(agent.id)
              }
            }}
            className={[
              'glass-panel p-5 text-left transition-all duration-300 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan',
              isActive
                ? 'border-cyan bg-cyan/5'
                : 'hover:border-cyan/30',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display text-lg text-warm leading-tight">{agent.name}</h3>
              <span
                className="font-mono text-[10px] text-cyan text-glow tabular-nums whitespace-nowrap px-2 py-0.5 rounded-full border border-cyan/20 bg-cyan/5"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                {agent.buildTime}
              </span>
            </div>
            <p className="font-sans text-sm text-muted leading-relaxed">{agent.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[9px] text-muted bg-white/5 px-2 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
