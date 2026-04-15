'use client'

import { motion } from 'framer-motion'
import type { Synopsis } from '@/lib/intake/types'

const EASE = [0.16, 1, 0.3, 1] as const
const CALENDLY_URL = 'https://calendly.com/kianjquinlan/30min'

type Props = {
  synopsis: Synopsis | null
  prototypeUrl?: string
}

export default function ConversionPanel({ synopsis, prototypeUrl }: Props) {
  const appName = synopsis?.appSpec.name ?? 'your prototype'

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE }}
      className="mx-auto max-w-3xl px-6 py-24 text-center"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
        What happens next
      </div>
      <h2 className="mt-4 font-serif text-4xl leading-tight text-warm md:text-5xl">
        {appName} is live. Now let&apos;s make it real.
      </h2>
      <p className="mt-6 text-warm/70 text-lg leading-relaxed">
        You&apos;ve seen the prototype in under a minute. In 48 hours, we build the
        production version — wired to your real data, your team, your customers.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-cyan-400/60 bg-cyan-400/10 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300 transition hover:bg-cyan-400/20"
        >
          Book the 48-hour build →
        </a>
        {prototypeUrl && (
          <a
            href={prototypeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-white/10 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-warm/70 transition hover:text-warm"
          >
            Open prototype ↗
          </a>
        )}
      </div>

      <div className="mt-16 grid gap-6 border-t border-white/[0.06] pt-10 text-left sm:grid-cols-3">
        <Step num="01" label="X-Ray" desc="60-second business scan — free, right here." />
        <Step num="02" label="48-Hour Proof" desc="We ship a working MVP in two days." />
        <Step num="03" label="Scale" desc="Residency and ongoing automation." />
      </div>
    </motion.section>
  )
}

function Step({ num, label, desc }: { num: string; label: string; desc: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
        {num} · {label}
      </div>
      <p className="mt-2 text-sm text-warm/65">{desc}</p>
    </div>
  )
}
