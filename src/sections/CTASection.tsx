'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const
const CALENDLY = 'https://calendly.com/kianjquinlan/30min'

export function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section
      id="cta"
      ref={ref}
      className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 scroll-mt-20 overflow-hidden"
    >
      {/* Spotlight radial gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,240,255,0.035) 0%, transparent 70%)',
        }}
      />

      {/* Top border */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,240,255,0.2) 50%, transparent)',
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Headline */}
        <div className="overflow-hidden mb-2">
          <motion.p
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1.2, ease: EASE }}
            className="font-display text-warm leading-[1.1]"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
          >
            Ready to see what
          </motion.p>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.p
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
            className="font-display leading-[1.1]"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
          >
            <span
              className="text-cyan"
              style={{ textShadow: '0 0 30px var(--cyan-glow), 0 0 60px rgba(0,240,255,0.15)' }}
            >
              48 hours
            </span>{' '}
            <span className="text-warm">can do?</span>
          </motion.p>
        </div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="mt-10"
        >
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-mono text-sm uppercase tracking-wider
              px-10 py-5 rounded-full
              bg-cyan text-deep font-medium
              hover:scale-[1.02] hover:shadow-[0_0_40px_var(--cyan-glow),0_0_80px_rgba(0,240,255,0.15)]
              transition-all duration-300
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-2
              will-change-transform"
            aria-label="Book your free Business X-Ray on Calendly"
          >
            Book Your X-Ray
          </a>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
          className="font-sans text-sm text-muted mt-6 max-w-md mx-auto"
        >
          15 minutes. No commitment. We'll show you exactly what we'd build.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
          className="font-mono text-xs mt-4"
          style={{ color: 'rgba(240,237,230,0.3)' }}
        >
          or email{' '}
          <a
            href="mailto:hello@insinuate.ai"
            className="hover:text-cyan transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan rounded"
          >
            hello@insinuate.ai
          </a>
        </motion.p>
      </div>
    </section>
  )
}
