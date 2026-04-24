'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

const workflows = [
  {
    title: 'Customer Support',
    before: {
      steps: [
        { label: 'Customer emails support', time: '0 min' },
        { label: 'Ticket auto-created in Zendesk', time: '1 min' },
        { label: 'Agent reads & researches issue', time: '18 min' },
        { label: 'Agent drafts response', time: '12 min' },
        { label: 'Manager review', time: '15 min' },
        { label: 'Response sent', time: '48 min' },
      ],
      total: '48 min avg',
      cost: '$14.20 per ticket',
      pain: 'Agents burned out. CSAT scores dropping.',
    },
    after: {
      steps: [
        { label: 'Customer emails support', time: '0 min' },
        { label: 'AI triages + categorizes', time: '2 sec' },
        { label: 'AI drafts response from knowledge base', time: '8 sec' },
        { label: 'Auto-sent for simple issues', time: '10 sec' },
        { label: 'Complex issues flagged for human', time: '— ' },
      ],
      total: '12 sec avg',
      cost: '$0.08 per ticket',
      gain: '83% handled without human touch.',
    },
  },
  {
    title: 'Invoice Processing',
    before: {
      steps: [
        { label: 'Invoice received via email', time: '0 min' },
        { label: 'Finance team downloads attachment', time: '30 min' },
        { label: 'Manual data entry into ERP', time: '25 min' },
        { label: 'Cross-check against PO', time: '20 min' },
        { label: 'Approval routing', time: '2 days' },
        { label: 'Payment scheduled', time: '3 days' },
      ],
      total: '3–5 days',
      cost: '$22.00 per invoice',
      pain: '12% error rate. Late payment penalties.',
    },
    after: {
      steps: [
        { label: 'Invoice received via email', time: '0 min' },
        { label: 'AI extracts all fields', time: '3 sec' },
        { label: 'Auto-matched to PO in ERP', time: '5 sec' },
        { label: 'Exceptions flagged to finance', time: '1 min' },
        { label: 'Approved & payment queued', time: '4 min' },
      ],
      total: '4 minutes',
      cost: '$0.65 per invoice',
      gain: '<0.2% error rate. Zero penalties.',
    },
  },
  {
    title: 'Sales Intelligence',
    before: {
      steps: [
        { label: 'Rep receives new lead', time: '0 min' },
        { label: 'Research company on LinkedIn', time: '20 min' },
        { label: 'Check CRM for history', time: '10 min' },
        { label: 'Google company news', time: '15 min' },
        { label: 'Write personalized email', time: '25 min' },
        { label: 'Send outreach', time: '70 min' },
      ],
      total: '70 min per lead',
      cost: '$35 in rep time',
      pain: 'Reps spend 40% of time on research.',
    },
    after: {
      steps: [
        { label: 'Lead enters CRM', time: '0 min' },
        { label: 'AI pulls enrichment data', time: '4 sec' },
        { label: 'AI scans news & signals', time: '6 sec' },
        { label: 'AI generates brief + email draft', time: '8 sec' },
        { label: 'Rep reviews & sends', time: '3 min' },
      ],
      total: '3 min per lead',
      cost: '$1.20 in rep time',
      gain: 'Reps focus on closing, not Googling.',
    },
  },
]

export function BeforeAfterSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const [activeWorkflow, setActiveWorkflow] = useState(0)
  const [view, setView] = useState<'before' | 'after'>('before')

  const wf = workflows[activeWorkflow]

  return (
    <section
      id="before-after"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 scroll-mt-20 border-b border-white/[0.05] overflow-hidden"
    >
      {/* Ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255,0,110,0.03) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 md:mb-24"
        >
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-cyan/60 mb-4 block">
            THE TRANSFORMATION
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-warm mb-4">
            Before &amp; After
          </h2>
          <p className="font-sans text-base text-muted max-w-md">
            The same workflow. Before we get involved. And after.
          </p>
        </motion.div>

        {/* Workflow selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {workflows.map((wf, i) => (
            <button
              key={wf.title}
              onClick={() => { setActiveWorkflow(i); setView('before') }}
              className={`font-mono text-xs tracking-wider uppercase px-4 py-2 rounded-full border transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan ${
                activeWorkflow === i
                  ? 'border-cyan/40 text-cyan bg-cyan/5'
                  : 'border-white/10 text-muted hover:border-white/20 hover:text-warm'
              }`}
              aria-pressed={activeWorkflow === i}
            >
              {wf.title}
            </button>
          ))}
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="flex items-center gap-1 mb-10 p-1 glass-panel w-fit rounded-full"
        >
          {(['before', 'after'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`font-mono text-xs tracking-wider uppercase px-6 py-2.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan ${
                view === v
                  ? v === 'before'
                    ? 'bg-magenta/20 text-magenta border border-magenta/30'
                    : 'bg-green/20 text-green border border-green/30'
                  : 'text-muted hover:text-warm'
              }`}
              aria-pressed={view === v}
            >
              {v === 'before' ? '— Before' : '+ After AI'}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeWorkflow}-${view}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Steps */}
              <div className="lg:col-span-2 glass-panel p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <span
                    className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1 rounded-full ${
                      view === 'before'
                        ? 'text-magenta bg-magenta/10 border border-magenta/20'
                        : 'text-green bg-green/10 border border-green/20'
                    }`}
                  >
                    {view === 'before' ? 'MANUAL WORKFLOW' : 'AI-POWERED WORKFLOW'}
                  </span>
                  <span className="font-mono text-xs text-muted">{wf.title}</span>
                </div>

                <div className="space-y-0">
                  {(view === 'before' ? wf.before.steps : wf.after.steps).map((step, i, arr) => (
                    <motion.div
                      key={`${step.label}-${i}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                      className="flex items-start gap-4 group"
                    >
                      {/* Connector */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full border mt-0.5 ${
                            view === 'before'
                              ? 'border-magenta/40 bg-magenta/10'
                              : 'border-green/40 bg-green/10'
                          }`}
                        />
                        {i < arr.length - 1 && (
                          <div
                            className={`w-px flex-1 mt-1 mb-1 min-h-[2rem] ${
                              view === 'before' ? 'bg-magenta/15' : 'bg-green/15'
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-sans text-sm text-warm">{step.label}</span>
                          <span
                            className={`font-mono text-xs shrink-0 ${
                              view === 'before' ? 'text-magenta/70' : 'text-green/70'
                            }`}
                          >
                            {step.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-col gap-4">
                <div className="glass-panel p-6 flex flex-col gap-2">
                  <span className="font-mono text-xs tracking-wider uppercase text-muted mb-1">
                    Total Time
                  </span>
                  <span
                    className={`font-mono text-3xl font-light ${
                      view === 'before' ? 'text-magenta' : 'text-green'
                    }`}
                    style={{
                      textShadow:
                        view === 'before'
                          ? '0 0 20px rgba(255,0,110,0.3)'
                          : '0 0 20px rgba(0,255,136,0.3)',
                    }}
                  >
                    {view === 'before' ? wf.before.total : wf.after.total}
                  </span>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-2">
                  <span className="font-mono text-xs tracking-wider uppercase text-muted mb-1">
                    Cost Per Unit
                  </span>
                  <span
                    className={`font-mono text-3xl font-light ${
                      view === 'before' ? 'text-magenta' : 'text-green'
                    }`}
                  >
                    {view === 'before' ? wf.before.cost : wf.after.cost}
                  </span>
                </div>

                <div className="glass-panel p-6 flex-1 flex flex-col justify-end">
                  <span
                    className={`font-sans text-sm leading-relaxed ${
                      view === 'before' ? 'text-muted' : 'text-warm'
                    }`}
                  >
                    {view === 'before' ? wf.before.pain : wf.after.gain}
                  </span>
                  {view === 'before' && (
                    <button
                      onClick={() => setView('after')}
                      className="mt-6 font-mono text-xs tracking-wider uppercase text-cyan hover:text-warm transition-colors duration-300 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan"
                      aria-label="See the AI-powered version"
                    >
                      See with AI →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
