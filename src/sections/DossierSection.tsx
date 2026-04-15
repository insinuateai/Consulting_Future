'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { DossierLauncher } from '@/components/dossier/DossierLauncher'

export function DossierSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="dossier"
      ref={ref}
      className="relative px-6 py-32 md:px-12 md:py-48 lg:px-24"
    >
      {/* subtle gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 30%, rgba(0,240,255,0.04), transparent 60%), radial-gradient(40% 40% at 80% 70%, rgba(255,0,110,0.03), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-3xl"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400">
            ░ THE DOSSIER
          </div>
          <h2 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-7xl">
            Watch 20 AI agents
            <br />
            <span className="text-cyan-400">build a strategic brief</span>
            <br />
            for your business — live.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-warm/65">
            McKinsey writes you a deck in 6 weeks. We write you a 10-page
            personalized strategic dossier in 90 seconds, and you watch every
            agent think in real time. Then we email it to you and offer to
            build the first opportunity in 48 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <DossierLauncher />
        </motion.div>
      </div>
    </section>
  )
}
