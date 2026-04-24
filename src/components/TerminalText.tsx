'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINES = [
  { time: '00:01', text: 'Resolving DNS...' },
  { time: '00:01', text: 'Fetching homepage...' },
  { time: '00:02', text: 'Analyzing DOM structure...' },
  { time: '00:02', text: 'Detecting frameworks...' },
  { time: '00:03', text: 'Scanning API endpoints...' },
  { time: '00:03', text: 'Mapping user flows...' },
]

export function TerminalText({ active }: { active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    const id = setInterval(() => {
      setCount(c => (c < LINES.length ? c + 1 : c))
    }, 400)
    return () => clearInterval(id)
  }, [active])

  return (
    <div className="font-mono text-sm space-y-2.5 min-h-[160px] pt-1">
      <AnimatePresence>
        {LINES.slice(0, count).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3"
          >
            <span className="text-muted tabular-nums w-[52px] flex-shrink-0 select-none">
              [{line.time}]
            </span>
            <span className="text-warm/80 flex-1">{line.text}</span>
            <span className="text-green select-none">✓</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {count < LINES.length && active && (
        <div className="flex items-center gap-3 text-muted">
          <span className="tabular-nums w-[52px] flex-shrink-0 select-none">
            [{LINES[count]?.time}]
          </span>
          <span className="text-warm/50 flex-1">{LINES[count]?.text}</span>
          <span className="text-cyan animate-pulse select-none">▋</span>
        </div>
      )}
    </div>
  )
}
