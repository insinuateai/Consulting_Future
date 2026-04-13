'use client'

import { useEffect } from 'react'
import { useSoundContext } from '@/lib/SoundContext'
import { useHackerMode } from '@/lib/HackerModeContext'

const TICKER_ITEMS = [
  'Agent #47 completed invoice batch — 2s ago',
  '$12.4K saved for Client Echo today',
  'Lead scoring model v3.1 deployed — 99.2% accuracy',
  'Support agent resolved ticket #9,241 in 4s',
  'Pipeline optimization: 8.2x throughput increase',
  'Uptime: 99.97% — 42 agents active',
  'Contract extraction: 340 docs processed in 18min',
  'Outbound sequence launched — 1,200 prospects enrolled',
  'Anomaly detected + flagged in billing pipeline — 0 human intervention',
  'Client Delta: $4.1M ARR pipeline qualified overnight',
  'New deployment: Proposal generator v2 — avg. time 11s',
  'Agent cluster auto-scaled to handle 3.4x traffic spike',
]

const L33T_MAP: Record<string, string> = {
  a: '4', e: '3', i: '1', o: '0', s: '5', t: '7',
  A: '4', E: '3', I: '1', O: '0', S: '5', T: '7',
}

function l33t(text: string): string {
  return text.split('').map(c => L33T_MAP[c] ?? c).join('')
}

export function Ticker() {
  const { playEffect, enabled } = useSoundContext()
  const { active: hackerMode } = useHackerMode()

  // Random blip every 5–10 seconds
  useEffect(() => {
    if (!enabled) return
    let timeoutId: ReturnType<typeof setTimeout>

    const schedule = () => {
      const delay = 5000 + Math.random() * 5000
      timeoutId = setTimeout(() => {
        playEffect('ticker-blip')
        schedule()
      }, delay)
    }

    schedule()
    return () => clearTimeout(timeoutId)
  }, [enabled, playEffect])

  const rawItems = hackerMode
    ? TICKER_ITEMS.map(l33t)
    : TICKER_ITEMS

  // Duplicate for seamless infinite loop
  const items = [...rawItems, ...rawItems]

  return (
    <div
      aria-hidden="true"
      className={[
        'hidden md:flex',
        'fixed bottom-0 left-0 right-0 z-40',
        'h-8 overflow-hidden',
        'bg-deep/90 backdrop-blur-sm',
        'border-t border-white/[0.05]',
        'items-center',
      ].join(' ')}
    >
      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          animation: 'ticker-scroll 40s linear infinite',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className="font-mono text-[10px] text-muted px-1"
              style={hackerMode ? { color: '#00FF88', textShadow: '0 0 6px #00FF8844' } : undefined}
            >
              {item}
            </span>
            <span
              className="font-mono text-[10px] text-cyan mx-3"
              style={{ textShadow: '0 0 8px #00F0FF66' }}
            >
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
