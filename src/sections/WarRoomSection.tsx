'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'

const EASE = [0.16, 1, 0.3, 1] as const

const stats = [
  { label: 'Hours Saved', value: 48320, suffix: '', prefix: '', decimals: 0 },
  { label: 'Revenue Unlocked', value: 12, suffix: 'M+', prefix: '$', decimals: 0 },
  { label: 'Automations Shipped', value: 247, suffix: '', prefix: '', decimals: 0 },
  { label: 'Avg ROI', value: 847, suffix: '%', prefix: '', decimals: 0 },
]

const feed = [
  { time: '00:03', label: 'Customer support AI deployed', client: 'APEX RETAIL', status: 'LIVE' },
  { time: '00:17', label: 'Invoice processing pipeline complete', client: 'MERIDIAN CAPITAL', status: 'LIVE' },
  { time: '00:44', label: 'Sales intelligence system online', client: 'NOVA VENTURES', status: 'LIVE' },
  { time: '01:12', label: 'Data reconciliation agent active', client: 'CORE LOGISTICS', status: 'LIVE' },
  { time: '01:38', label: 'Content generation stack ready', client: 'STRAND MEDIA', status: 'LIVE' },
  { time: '02:05', label: 'Lead qualification bot deployed', client: 'ATLAS GROWTH', status: 'LIVE' },
]

function StatCounter({
  value,
  suffix,
  prefix,
  active,
}: {
  value: number
  suffix: string
  prefix: string
  active: boolean
}) {
  const count = useCountUp(active ? value : 0, 2500)
  return (
    <span className="font-mono text-4xl md:text-5xl font-light text-cyan tabular-nums" style={{ textShadow: '0 0 20px var(--cyan-glow)' }}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export function WarRoomSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="warroom"
      ref={ref}
      className="relative min-h-screen py-32 md:py-48 px-6 md:px-12 lg:px-24 scroll-mt-20 border-b border-white/[0.05] overflow-hidden"
    >
      {/* Ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,240,255,0.04) 0%, transparent 70%)',
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
            THE WAR ROOM
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-warm mb-4">
            Results, not<br />
            <em>reports</em>
          </h2>
          <p className="font-sans text-base text-muted max-w-md">
            Every engagement is tracked in real time. This is what shipped.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="glass-panel p-6 md:p-8 flex flex-col gap-3"
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                active={inView}
              />
              <span className="font-mono text-xs tracking-[0.15em] uppercase text-muted">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="glass-panel overflow-hidden"
        >
          {/* Feed header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-green">
              LIVE MISSIONS
            </span>
            <span className="ml-auto font-mono text-xs text-muted">
              {new Date().toUTCString().slice(17, 22)} UTC
            </span>
          </div>

          {/* Feed rows */}
          <div className="divide-y divide-white/[0.04]">
            {feed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors duration-300"
              >
                <span className="font-mono text-xs text-muted w-10 shrink-0">
                  +{item.time}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan-glow)' }}
                />
                <span className="font-sans text-sm text-warm flex-1 min-w-0 truncate">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-muted hidden sm:block shrink-0">
                  {item.client}
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase text-green bg-green/10 px-2 py-0.5 rounded-full shrink-0">
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
