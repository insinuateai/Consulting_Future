'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { AgentSelector } from '@/components/playground/AgentSelector'
import { InvoiceAgent } from '@/components/playground/InvoiceAgent'
import { LeadScoringAgent } from '@/components/playground/LeadScoringAgent'
import { SupportAgent } from '@/components/playground/SupportAgent'
import { type AgentId } from '@/lib/playgroundAgents'
import { useSoundContext } from '@/lib/SoundContext'

const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.8, ease: EASE },
  }),
}

export function PlaygroundSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })
  const [active, setActive] = useState<AgentId>('invoice')
  const { playEffect } = useSoundContext()

  return (
    <section
      ref={sectionRef}
      id="playground"
      className="pt-32 md:pt-40 pb-24 px-6 md:px-12 lg:px-24 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-mono text-[10px] tracking-[0.3em] text-cyan uppercase mb-4"
          >
            Playground
          </motion.p>
          <motion.h1
            custom={0.15}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-display font-normal text-[clamp(2rem,5vw,4.5rem)] text-warm leading-tight"
          >
            Test-drive the agents
          </motion.h1>
          <motion.p
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-muted max-w-2xl mx-auto mt-4 text-lg leading-relaxed"
          >
            Real agents we shipped. Interact with them below — every pipeline runs live.
          </motion.p>
        </div>

        {/* Selector */}
        <motion.div
          custom={0.4}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <AgentSelector active={active} onChange={setActive} />
        </motion.div>

        {/* Active agent */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {active === 'invoice' && <InvoiceAgent />}
              {active === 'leads' && <LeadScoringAgent />}
              {active === 'support' && <SupportAgent />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-24">
          <p className="font-display text-2xl md:text-3xl text-warm mb-8 leading-snug">
            Want one of your own<br className="hidden md:block" /> built in a weekend?
          </p>
          <motion.a
            href="https://calendly.com/kianjquinlan/30min"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playEffect('hover')}
            onClick={() => playEffect('click')}
            className="cta-button inline-block bg-cyan text-deep font-mono text-sm uppercase tracking-wider px-10 py-4 rounded-full transition-all duration-300"
            whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(0,240,255,0.38)' }}
          >
            Book a 30-minute call
          </motion.a>
          <p className="text-muted text-sm mt-3">No pitch deck. Just a working demo.</p>
        </div>
      </div>
    </section>
  )
}
