'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

const PARAGRAPHS = [
  'Most AI agencies sell decks.\nWe ship systems.',
  'Most promise transformation in quarters.\nWe deliver in days.',
  'Most have consultants.\nWe have engineers.',
  'Most want retainers.\nWe want results.',
  'We believe the gap between what AI can do\nand what businesses actually use\nis the biggest opportunity of our generation.',
  'We exist to close that gap.\nViolently fast.',
  '— Insinuate',
]

function Paragraph({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const isSignature = text.startsWith('—')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, ease: EASE, delay: 0.05 }}
      className={[
        'mb-12',
        isSignature ? 'mt-8 pt-8 border-t border-white/[0.06]' : '',
      ].join(' ')}
    >
      {text.split('\n').map((line, i) => (
        <p
          key={i}
          className={[
            'leading-relaxed',
            isSignature
              ? 'font-mono text-sm text-muted tracking-widest'
              : index >= PARAGRAPHS.length - 2 && !isSignature
              ? 'font-display text-2xl md:text-3xl text-warm font-normal'
              : 'font-display text-2xl md:text-3xl text-warm font-normal',
          ].join(' ')}
        >
          {line}
        </p>
      ))}
    </motion.div>
  )
}

export default function ManifestoPage() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <main className="min-h-screen bg-deep text-warm px-6 py-24 md:py-40">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="font-mono text-[10px] tracking-[0.3em] text-cyan uppercase mb-6"
          >
            Manifesto
          </motion.p>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={headerInView ? { y: 0 } : {}}
              transition={{ duration: 1.2, ease: EASE }}
              className="font-display text-5xl md:text-7xl text-warm font-normal leading-tight"
            >
              The Manifesto
            </motion.h1>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.0, ease: EASE, delay: 0.3 }}
            style={{ originX: 0 }}
            className="h-px bg-white/[0.08] mt-8"
          />
        </div>

        {/* Paragraphs */}
        <div>
          {PARAGRAPHS.map((text, i) => (
            <Paragraph key={i} text={text} index={i} />
          ))}
        </div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 pt-12 border-t border-white/[0.06]"
        >
          <a
            href="/"
            className="font-mono text-xs text-muted hover:text-cyan transition-colors duration-300 tracking-wider"
          >
            ← Back
          </a>
        </motion.div>

      </div>
    </main>
  )
}
