'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  type Q1Option,
  type Q2Option,
  type Q3Option,
  blueprintConfigs,
  computeMetrics,
} from '@/lib/blueprintData'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Question data ────────────────────────────────────────────────────────────

const Q1_OPTIONS: { label: Q1Option; icon: string }[] = [
  { label: 'Customer Support',    icon: '💬' },
  { label: 'Data Processing',     icon: '📊' },
  { label: 'Sales & Lead Gen',    icon: '🎯' },
  { label: 'Content & Marketing', icon: '✍️' },
  { label: 'Internal Operations', icon: '⚙️' },
]

const Q2_OPTIONS: Q2Option[] = ['< 10 hours', '10-30 hours', '30-80 hours', '80+ hours']
const Q3_OPTIONS: Q3Option[] = ['Just me', '2-10 people', '11-50 people', '50+ people']

type Step = 'q1' | 'q2' | 'q3' | 'generating' | 'result'

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionCard({
  label,
  icon,
  selected,
  onClick,
  className = '',
}: {
  label: string
  icon?: string
  selected: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`glass-panel p-4 cursor-pointer text-center transition-all duration-300 hover:border-cyan/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan ${
        selected ? 'border-cyan bg-cyan/5' : ''
      } ${className}`}
    >
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="font-mono text-sm text-warm">{label}</div>
    </button>
  )
}

function QuestionStep({
  questionNum,
  question,
  children,
}: {
  questionNum: number
  question: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      key={`q${questionNum}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan mb-3">
        Question {questionNum} of 3
      </p>
      <h3 className="font-display text-2xl text-warm mb-8">{question}</h3>
      {children}
    </motion.div>
  )
}

// ─── Generating loader ────────────────────────────────────────────────────────

function GeneratingState() {
  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center py-12"
    >
      {/* Spinning square */}
      <div className="relative w-16 h-16 mb-8">
        <motion.div
          className="absolute inset-0 border border-cyan rounded-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 border border-cyan/40 rounded-sm"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[6px] border border-cyan/20 rounded-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Text with blinking cursor */}
      <p className="font-mono text-cyan text-base">
        Generating your blueprint
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          _
        </motion.span>
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Architecture diagram ─────────────────────────────────────────────────────

function ArchBox({
  layer,
  accent = false,
}: {
  layer: { label: string; items: string[] }
  accent?: boolean
}) {
  return (
    <div
      className={`glass-panel p-5 flex-1 min-w-0 ${
        accent ? 'border-cyan/20 bg-cyan/[0.03]' : ''
      }`}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-3">
        {layer.label}
      </p>
      <div className="flex flex-col gap-1.5">
        {layer.items.map((item) => (
          <div
            key={item}
            className="font-mono text-xs text-warm bg-white/[0.04] px-3 py-1.5 rounded-sm border border-white/[0.06]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function ArrowConnector() {
  return (
    <div className="flex-shrink-0 flex items-center px-2 text-cyan font-mono text-lg select-none">
      →
    </div>
  )
}

function SupportingBox({ label }: { label: string }) {
  return (
    <div className="glass-panel px-4 py-3 font-mono text-xs text-muted border-dashed border-white/[0.08] text-center">
      {label}
    </div>
  )
}

// ─── Result blueprint ─────────────────────────────────────────────────────────

function BlueprintResult({
  q1,
  q2,
  q3,
  onReset,
}: {
  q1: Q1Option
  q2: Q2Option
  q3: Q3Option
  onReset: () => void
}) {
  const config = blueprintConfigs[q1]
  const metrics = computeMetrics(q1, q2, q3)

  function handleDownload() {
    const date = new Date().toISOString().split('T')[0]
    const slug = q1.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const content = `INSINUATE.AI — AI ARCHITECTURE BLUEPRINT
Generated: ${date}

Profile: ${q1} Automation · ${q3} · ${q2}/week

ARCHITECTURE
────────────────────────────────
${config.sources.label.toUpperCase()}
${config.sources.items.map(i => `  • ${i}`).join('\n')}

${config.processing.label.toUpperCase()}
${config.processing.items.map(i => `  • ${i}`).join('\n')}

${config.output.label.toUpperCase()}
${config.output.items.map(i => `  • ${i}`).join('\n')}

SUPPORTING SYSTEMS
${config.supporting.map(i => `  • ${i}`).join('\n')}

PROJECTIONS
────────────────────────────────
Est. Build Time:     ${metrics.buildTime}
Est. Annual Savings: ${metrics.savings}
Automation Rate:     ${metrics.automationRate}

────────────────────────────────
Ready to build? https://calendly.com/kianjquinlan/30min
`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `insinuate-blueprint-${slug}-${date}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass-panel-strong p-8">
        {/* Blueprint header */}
        <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
          <h3 className="font-display text-2xl text-cyan text-glow">
            Your AI Blueprint
          </h3>
          <button
            onClick={onReset}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-warm transition-colors"
          >
            ← Start Over
          </button>
        </div>
        <p className="font-mono text-xs text-muted mb-8">
          {q1} Automation · {q3} · {q2}/week
        </p>

        {/* Architecture diagram — main flow */}
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          <ArchBox layer={config.sources} />
          <ArrowConnector />
          <ArchBox layer={config.processing} accent />
          <ArrowConnector />
          <ArchBox layer={config.output} />
        </div>

        {/* Supporting systems */}
        <div className="mt-6">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-3">
            Supporting Systems
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {config.supporting.map((s) => (
              <SupportingBox key={s} label={s} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/5" />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
              Est. Build Time
            </p>
            <p className="font-mono text-xl text-cyan text-glow tabular-nums">
              {metrics.buildTime}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
              Est. Annual Savings
            </p>
            <p className="font-mono text-xl text-green tabular-nums">
              {metrics.savings}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
              Automation Rate
            </p>
            <p className="font-mono text-xl text-cyan text-glow tabular-nums">
              {metrics.automationRate}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/5" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="https://calendly.com/kianjquinlan/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center font-mono text-sm uppercase tracking-widest py-4 px-8 bg-cyan text-deep rounded-sm hover:bg-cyan/90 transition-all duration-300 glow-cyan"
          >
            Let&apos;s Build This
          </a>

          <button
            onClick={handleDownload}
            className="font-mono text-sm uppercase tracking-widest py-4 px-8 glass-panel hover:border-cyan/30 text-muted hover:text-warm transition-all duration-300 rounded-sm"
          >
            Download Blueprint
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function BlueprintSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 })

  const [step, setStep] = useState<Step>('q1')
  const [q1, setQ1] = useState<Q1Option | null>(null)
  const [q2, setQ2] = useState<Q2Option | null>(null)
  const [q3, setQ3] = useState<Q3Option | null>(null)

  function selectQ1(val: Q1Option) {
    setQ1(val)
    setTimeout(() => setStep('q2'), 300)
  }

  function selectQ2(val: Q2Option) {
    setQ2(val)
    setTimeout(() => setStep('q3'), 300)
  }

  function selectQ3(val: Q3Option) {
    setQ3(val)
    setStep('generating')
    setTimeout(() => setStep('result'), 2600)
  }

  function reset() {
    setStep('q1')
    setQ1(null)
    setQ2(null)
    setQ3(null)
  }

  return (
    <section
      id="blueprint"
      className="min-h-screen py-32 md:py-48 px-6 md:px-12 lg:px-24 border-b border-white/[0.05] relative scroll-mt-20"
    >
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 20% 60%, rgba(255,0,110,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE }}
          className="text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan mb-4">
            Your Blueprint
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-warm">
            What Would We Build You?
          </h2>
          <p className="mt-4 font-sans text-base text-muted max-w-xl mx-auto">
            Answer 3 questions. Get a custom AI architecture in 30 seconds.
          </p>
        </motion.div>

        {/* Question flow / result */}
        <div className="mt-16">
          <AnimatePresence mode="wait">
            {step === 'result' && q1 && q2 && q3 ? (
              <BlueprintResult
                key="result"
                q1={q1}
                q2={q2}
                q3={q3}
                onReset={reset}
              />
            ) : step === 'generating' ? (
              <div className="max-w-2xl mx-auto glass-panel-strong p-10">
                <GeneratingState key="generating" />
              </div>
            ) : (
              <div className="max-w-2xl mx-auto glass-panel-strong p-10">
                <AnimatePresence mode="wait">
                  {step === 'q1' && (
                    <QuestionStep
                      questionNum={1}
                      question="What's your biggest operational bottleneck?"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Q1_OPTIONS.map(({ label, icon }, i) => (
                          <OptionCard
                            key={label}
                            label={label}
                            icon={icon}
                            selected={q1 === label}
                            onClick={() => selectQ1(label)}
                            /* Center the 5th card spanning full width on sm+ */
                            className={
                              i === 4 ? 'sm:col-span-2 sm:max-w-[50%] sm:mx-auto w-full' : ''
                            }
                          />
                        ))}
                      </div>
                    </QuestionStep>
                  )}

                  {step === 'q2' && (
                    <QuestionStep
                      questionNum={2}
                      question="How much time does your team spend on this weekly?"
                    >
                      <div className="flex flex-wrap gap-3">
                        {Q2_OPTIONS.map((opt) => (
                          <OptionCard
                            key={opt}
                            label={opt}
                            selected={q2 === opt}
                            onClick={() => selectQ2(opt)}
                            className="flex-1 min-w-[120px]"
                          />
                        ))}
                      </div>
                    </QuestionStep>
                  )}

                  {step === 'q3' && (
                    <QuestionStep
                      questionNum={3}
                      question="What's your team size?"
                    >
                      <div className="flex flex-wrap gap-3">
                        {Q3_OPTIONS.map((opt) => (
                          <OptionCard
                            key={opt}
                            label={opt}
                            selected={q3 === opt}
                            onClick={() => selectQ3(opt)}
                            className="flex-1 min-w-[120px]"
                          />
                        ))}
                      </div>
                    </QuestionStep>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
