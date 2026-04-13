'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { TerminalText } from '@/components/TerminalText'
import { RadarScan } from '@/components/RadarScan'
import { XRayResults } from '@/components/XRayResults'
import { useSoundContext } from '@/lib/SoundContext'

type Phase = 'idle' | 'scanning' | 'tech_stack' | 'opportunities' | 'results' | 'cta'

const EASE = [0.16, 1, 0.3, 1] as const

const PHASE_LABEL: Record<Phase, string> = {
  idle: '',
  scanning: 'Scanning website...',
  tech_stack: 'Tech stack identified',
  opportunities: 'Identifying AI opportunities...',
  results: 'Analysis Complete',
  cta: 'Analysis Complete',
}

const PHASE_PROGRESS: Record<Phase, number> = {
  idle: 0, scanning: 25, tech_stack: 50, opportunities: 75, results: 100, cta: 100,
}

const TECH_STACK = ['React', 'AWS', 'PostgreSQL', 'Stripe', 'Vercel', 'HubSpot']

export function XRaySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { playEffect } = useSoundContext()

  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('')

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const advancePhase = useCallback((next: Phase) => {
    setPhase(next)
    if (next === 'results') {
      playEffect('xray-complete')
    } else if (next !== 'idle' && next !== 'cta') {
      playEffect('xray-scan')
    }
  }, [playEffect])

  const startAnalysis = () => {
    if (!url.trim()) return
    clearTimers()
    playEffect('click')
    advancePhase('scanning')
    timers.current.push(setTimeout(() => advancePhase('tech_stack'),   3000))
    timers.current.push(setTimeout(() => advancePhase('opportunities'), 5000))
    timers.current.push(setTimeout(() => advancePhase('results'),       8000))
    timers.current.push(setTimeout(() => setPhase('cta'),              11000))
  }

  const reset = () => {
    clearTimers()
    setPhase('idle')
    setUrl('')
  }

  useEffect(() => () => clearTimers(), []) // eslint-disable-line react-hooks/exhaustive-deps

  const isAnalyzing = phase !== 'idle'
  const isComplete  = phase === 'results' || phase === 'cta'
  const progress    = PHASE_PROGRESS[phase]

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (d: number) => ({
      opacity: 1, y: 0,
      transition: { delay: d, duration: 0.8, ease: EASE },
    }),
  }

  return (
    <section ref={sectionRef} id="xray" className="py-32 md:py-48 px-6 md:px-12 lg:px-24 scroll-mt-20">
      <div className="max-w-4xl mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-16">
          <motion.p
            custom={0} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-mono text-[10px] tracking-[0.3em] text-cyan uppercase mb-4"
          >
            Diagnostic
          </motion.p>
          <motion.h2
            custom={0.15} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-display font-normal text-[clamp(2rem,5vw,4.5rem)] text-warm leading-tight"
          >
            Your 60-Second<br />Business X-Ray
          </motion.h2>
          <motion.p
            custom={0.3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="text-muted max-w-2xl mx-auto mt-4 text-lg leading-relaxed"
          >
            Enter your URL. Our AI analyzes your tech stack, workflows, and AI opportunities in real-time.
          </motion.p>
        </div>

        {/* ── Input / Analysis toggle ── */}
        <AnimatePresence mode="wait">

          {/* Input panel */}
          {!isAnalyzing && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="glass-panel max-w-2xl mx-auto p-8"
            >
              <label htmlFor="xray-url" className="sr-only">Your company URL</label>
              <input
                id="xray-url"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startAnalysis()}
                placeholder="https://yourcompany.com"
                className="w-full bg-transparent border-b-2 border-white/10 focus:border-cyan outline-none text-warm font-mono text-lg py-3 placeholder:text-muted/40 transition-colors duration-300"
                autoComplete="off"
                spellCheck={false}
              />
              <motion.button
                onClick={startAnalysis}
                disabled={!url.trim()}
                onMouseEnter={() => playEffect('hover')}
                className="mt-6 w-full bg-cyan text-deep font-mono text-sm uppercase tracking-wider py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={url.trim() ? { boxShadow: '0 0 32px rgba(0,240,255,0.38)' } : {}}
              >
                Analyze My Business
              </motion.button>
            </motion.div>
          )}

          {/* Analysis panel */}
          {isAnalyzing && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="w-full"
            >
              {/* Progress header */}
              <div className="glass-panel-strong p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-sm ${isComplete ? 'text-green' : 'text-muted'}`}>
                    {PHASE_LABEL[phase]}
                    {phase === 'scanning' && (
                      <span className="text-cyan animate-pulse ml-1">▋</span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-muted tabular-nums">{progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-px bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan rounded-full"
                    animate={{
                      width: `${progress}%`,
                      boxShadow: isComplete ? '0 0 12px rgba(0,240,255,0.65)' : 'none',
                    }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                  />
                </div>

                {/* Phase-specific content */}
                <div className="mt-6">
                  <AnimatePresence mode="wait">

                    {phase === 'scanning' && (
                      <motion.div key="scan"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TerminalText active />
                      </motion.div>
                    )}

                    {phase === 'tech_stack' && (
                      <motion.div key="tech"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-wrap gap-2 pt-1">
                          {TECH_STACK.map((t, i) => (
                            <motion.span
                              key={t}
                              initial={{ opacity: 0, scale: 0.75 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.12, duration: 0.4, ease: EASE }}
                              className="glass-panel px-3 py-1.5 font-mono text-xs border border-cyan/20 text-warm"
                            >
                              {t}
                            </motion.span>
                          ))}
                        </div>
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                          className="font-mono text-sm text-cyan mt-4"
                        >
                          4 integration points identified
                        </motion.p>
                      </motion.div>
                    )}

                    {phase === 'opportunities' && (
                      <motion.div key="radar"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RadarScan active />
                      </motion.div>
                    )}

                    {isComplete && (
                      <motion.div key="done"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="font-mono text-sm text-green pt-1">
                          4 opportunities identified across {TECH_STACK.length} systems
                        </p>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

              {/* Result cards */}
              <AnimatePresence>
                {isComplete && <XRayResults key="results" />}
              </AnimatePresence>

              {/* Final CTA */}
              <AnimatePresence>
                {phase === 'cta' && (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="text-center mt-16"
                  >
                    <p className="font-display text-2xl md:text-3xl text-warm mb-8 leading-snug">
                      This is a surface-level scan.<br className="hidden md:block" /> Imagine what a full analysis reveals.
                    </p>
                    <motion.a
                      href="https://calendly.com/kianjquinlan/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => playEffect('hover')}
                      className="cta-button inline-block bg-cyan text-deep font-mono text-sm uppercase tracking-wider px-10 py-4 rounded-full transition-all duration-300"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(0,240,255,0.38)' }}
                    >
                      Get Your Full X-Ray — Free
                    </motion.a>
                    <p className="text-muted text-sm mt-3">Takes 15 minutes. No commitment.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan another */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-10"
                  >
                    <button
                      onClick={reset}
                      className="font-mono text-xs text-muted uppercase tracking-wider hover:text-cyan transition-colors duration-300"
                    >
                      ↩ Scan another URL
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
