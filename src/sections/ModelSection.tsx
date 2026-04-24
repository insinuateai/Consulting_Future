'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

const stages = [
  {
    num: '01',
    title: 'X-Ray',
    subtitle: 'Free',
    subtitleColor: 'text-green bg-green/10',
    description:
      'We analyze your business in 60 seconds. Tech stack, workflows, AI opportunities, estimated ROI. No strings attached.',
    duration: '60 seconds',
  },
  {
    num: '02',
    title: '48-Hour Proof',
    subtitle: 'Risk-free',
    subtitleColor: 'text-cyan bg-cyan/10',
    description:
      'We build your highest-impact AI solution — fully working, deployed — before you spend a dollar. You wake up to a Loom video of your problem, solved.',
    duration: '48 hours',
  },
  {
    num: '03',
    title: 'Residency',
    subtitle: '$25K–$75K',
    subtitleColor: 'text-amber bg-amber/10',
    description:
      'One week. We embed in your team, build your entire AI infrastructure, train your people, and leave everything running. Monday to Friday transformation.',
    duration: '1 week',
  },
  {
    num: '04',
    title: 'Scale',
    subtitle: 'Custom',
    subtitleColor: 'text-magenta bg-magenta/10',
    description:
      'Ongoing AI infrastructure management. New automations. Model optimization. Your AI systems get smarter every month.',
    duration: 'Ongoing',
  },
]

export function ModelSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      id="how"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-12 lg:px-24 scroll-mt-20 border-b border-white/[0.05] overflow-hidden"
    >
      {/* Ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 80% 50%, rgba(0,240,255,0.03) 0%, transparent 60%)',
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
            THE PROCESS
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-warm mb-4">
            How We Work
          </h2>
          <p className="font-sans text-base text-muted max-w-md">
            Four stages. Zero guesswork.
          </p>
        </motion.div>

        {/* Timeline — horizontal desktop, vertical mobile */}
        <div className="flex flex-col md:flex-row gap-0 md:gap-0 relative">
          {stages.map((stage, i) => (
            <div key={stage.num} className="flex flex-col md:flex-row flex-1 min-w-0">
              {/* Stage card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.15 }}
                className="group glass-panel p-8 flex-1 relative overflow-hidden
                  hover:-translate-y-1 hover:border-cyan/10 transition-all duration-300
                  will-change-transform"
              >
                {/* Giant watermark number */}
                <span
                  aria-hidden="true"
                  className="absolute -top-4 -right-2 font-mono font-light select-none pointer-events-none"
                  style={{
                    fontSize: 'clamp(4rem, 8vw, 7rem)',
                    color: 'rgba(0, 240, 255, 0.06)',
                    lineHeight: 1,
                  }}
                >
                  {stage.num}
                </span>

                {/* Content */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs tracking-wider uppercase text-muted">
                      {stage.num}
                    </span>
                    <span
                      className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full ${stage.subtitleColor}`}
                    >
                      {stage.subtitle}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl text-cyan mb-3">{stage.title}</h3>

                  <p className="font-sans text-sm text-muted leading-relaxed max-w-[250px] mb-6">
                    {stage.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--cyan)' }}
                    />
                    <span className="font-mono text-xs text-muted">{stage.duration}</span>
                  </div>
                </div>
              </motion.div>

              {/* Connector (between stages) */}
              {i < stages.length - 1 && (
                <div className="flex items-center justify-center md:items-center md:justify-center">
                  {/* Vertical on mobile, horizontal on desktop */}
                  <div className="relative md:hidden flex flex-col items-center py-2">
                    <ConnectorLine inView={inView} delay={i * 0.15 + 0.4} vertical />
                  </div>
                  <div className="hidden md:flex items-center w-6 shrink-0">
                    <ConnectorLine inView={inView} delay={i * 0.15 + 0.4} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ConnectorLine({
  inView,
  delay,
  vertical,
}: {
  inView: boolean
  delay: number
  vertical?: boolean
}) {
  return (
    <div
      className={`relative flex items-center justify-center ${
        vertical ? 'flex-col h-8 w-px' : 'flex-row w-full h-px'
      }`}
    >
      {/* Track */}
      <div
        className={`absolute ${vertical ? 'w-px h-full' : 'h-px w-full'}`}
        style={{ backgroundColor: 'rgba(240,237,230,0.08)' }}
      />
      {/* Animated fill */}
      <motion.div
        className={`absolute ${vertical ? 'w-px top-0' : 'h-px left-0'}`}
        style={{ backgroundColor: 'var(--cyan)' }}
        initial={vertical ? { height: 0 } : { width: 0 }}
        animate={
          inView
            ? vertical
              ? { height: '100%' }
              : { width: '100%' }
            : {}
        }
        transition={{ duration: 0.6, ease: EASE, delay }}
      />
      {/* Dot at end */}
      <motion.div
        className={`absolute w-1.5 h-1.5 rounded-full ${vertical ? 'bottom-0' : 'right-0'}`}
        style={{ backgroundColor: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan-glow)' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.3, ease: EASE, delay: delay + 0.5 }}
      />
    </div>
  )
}
