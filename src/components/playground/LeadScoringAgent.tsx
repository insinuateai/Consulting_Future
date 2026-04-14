'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEAD_SAMPLES, LEAD_STAGES, type LeadSample, type LeadBand } from '@/lib/playgroundAgents'
import { useSoundContext } from '@/lib/SoundContext'
import { useCountUp } from '@/hooks/useCountUp'

const EASE = [0.16, 1, 0.3, 1] as const

const BAND_COLOR: Record<LeadBand, string> = {
  hot: 'text-green',
  warm: 'text-amber',
  cold: 'text-muted',
}

const BAND_LABEL: Record<LeadBand, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
}

function ScoreDisplay({ lead }: { lead: LeadSample }) {
  const score = useCountUp(lead.score, 2000)
  return (
    <div className="text-center py-6">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">Lead score</p>
      <p className={`font-display text-7xl md:text-8xl tabular-nums ${BAND_COLOR[lead.band]}`}>
        {score}
      </p>
      <p className={`font-mono text-xs uppercase tracking-widest mt-2 ${BAND_COLOR[lead.band]}`}>
        {BAND_LABEL[lead.band]} lead
      </p>
    </div>
  )
}

export function LeadScoringAgent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [stageIdx, setStageIdx] = useState(-1)
  const [showResult, setShowResult] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { playEffect } = useSoundContext()

  const lead = LEAD_SAMPLES.find((l) => l.id === selectedId) ?? null
  const activeStage = stageIdx >= 0 ? LEAD_STAGES[stageIdx] : null
  const progress = activeStage?.pct ?? 0
  const done = stageIdx === LEAD_STAGES.length - 1

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const selectLead = (id: string) => {
    clearTimers()
    playEffect('click')
    setSelectedId(id)
    setRunning(false)
    setStageIdx(-1)
    setShowResult(false)
  }

  const score = () => {
    if (!lead) return
    clearTimers()
    setRunning(true)
    setStageIdx(-1)
    setShowResult(false)
    playEffect('click')
    playEffect('xray-scan')

    LEAD_STAGES.forEach((stage, i) => {
      timers.current.push(
        setTimeout(() => {
          setStageIdx(i)
          if (stage.label === 'Done') {
            playEffect('xray-complete')
            setShowResult(true)
          }
        }, stage.delayMs)
      )
    })
  }

  const reset = () => {
    clearTimers()
    setSelectedId(null)
    setRunning(false)
    setStageIdx(-1)
    setShowResult(false)
  }

  return (
    <div className="space-y-6">
      {/* Sample picker */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mb-3">
          Pick a lead to score
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LEAD_SAMPLES.map((l) => (
            <button
              key={l.id}
              onClick={() => selectLead(l.id)}
              onMouseEnter={() => playEffect('hover')}
              className={[
                'glass-panel p-4 text-left transition-all duration-300 cursor-pointer',
                l.id === selectedId
                  ? 'border-cyan bg-cyan/5'
                  : 'hover:border-cyan/30',
              ].join(' ')}
            >
              <p className="font-display text-base text-warm">{l.company}</p>
              <p className="font-mono text-[10px] text-muted mt-1">{l.industry}</p>
              <p className="font-mono text-[10px] text-muted">{l.headcount}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Profile + scoring */}
      <AnimatePresence mode="wait">
        {lead && (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Profile */}
            <div className="glass-panel p-6 space-y-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Company</p>
                <p className="font-display text-xl text-warm">{lead.company}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Industry</p>
                  <p className="font-mono text-xs text-warm">{lead.industry}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Revenue</p>
                  <p className="font-mono text-xs text-warm">{lead.revenue}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Headcount</p>
                  <p className="font-mono text-xs text-warm">{lead.headcount}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Contact</p>
                  <p className="font-mono text-xs text-warm">{lead.title}</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">Recent signals</p>
                <ul className="space-y-1">
                  {lead.recentSignals.map((s) => (
                    <li key={s} className="font-mono text-xs text-warm flex gap-2">
                      <span className="text-cyan">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Scoring panel */}
            <div className="glass-panel-strong p-6">
              {!running && !showResult && (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <p className="font-mono text-xs text-muted mb-6 max-w-xs">
                    Run the scoring pipeline to see how this lead ranks against your ICP.
                  </p>
                  <button
                    onClick={score}
                    onMouseEnter={() => playEffect('hover')}
                    className="bg-cyan text-deep font-mono text-sm uppercase tracking-wider px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-[0_0_32px_rgba(0,240,255,0.38)]"
                  >
                    Score this lead
                  </button>
                </div>
              )}

              {running && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-mono text-sm ${done ? 'text-green' : 'text-muted'}`}>
                      {activeStage?.label}
                      {!done && <span className="text-cyan animate-pulse ml-1">▋</span>}
                    </span>
                    <span className="font-mono text-xs text-muted tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-px bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan rounded-full"
                      animate={{
                        width: `${progress}%`,
                        boxShadow: done ? '0 0 12px rgba(0,240,255,0.65)' : 'none',
                      }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <ScoreDisplay lead={lead} />

                      <div className="space-y-2 mt-2">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">
                          Signal breakdown
                        </p>
                        {lead.signals.map((sig, i) => (
                          <motion.div
                            key={sig.label}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                          >
                            <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                              <span className={sig.matched ? 'text-warm' : 'text-muted line-through'}>
                                {sig.label}
                              </span>
                              <span className="tabular-nums text-muted">+{sig.weight}</span>
                            </div>
                            <div className="h-px bg-white/5 overflow-hidden">
                              <motion.div
                                className={`h-full ${sig.matched ? 'bg-cyan' : 'bg-white/10'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(sig.weight * 3, 100)}%` }}
                                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-5">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">
                          Rationale
                        </p>
                        <ul className="space-y-1">
                          {lead.rationale.map((r) => (
                            <li key={r} className="font-sans text-xs text-muted flex gap-2 leading-relaxed">
                              <span className="text-cyan">→</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`mt-5 glass-panel p-3 font-mono text-xs border ${
                        lead.band === 'hot' ? 'border-green/30 text-green'
                        : lead.band === 'warm' ? 'border-amber/30 text-amber'
                        : 'border-white/10 text-muted'
                      }`}>
                        → {lead.recommendedAction}
                      </div>

                      <div className="text-center mt-4">
                        <button
                          onClick={reset}
                          className="font-mono text-xs text-muted uppercase tracking-wider hover:text-cyan transition-colors"
                        >
                          ↩ Start over
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
