'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import { useHackerMode } from '@/lib/HackerModeContext'

const EASE = [0.16, 1, 0.3, 1] as const

const STATS = [
  { label: 'Framework', value: 'Next.js 14' },
  { label: 'Particles', value: '4,000' },
  { label: 'Animations', value: '47' },
  { label: 'Bundle', value: '287KB gzipped' },
  { label: 'Render', value: 'SSR + Client' },
  { label: 'Status', value: 'ALL SYSTEMS GO' },
]

export function HackerMode() {
  const { active, setActive } = useHackerMode()
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const activate = useCallback(() => setActive(true), [setActive])
  useKonamiCode(activate)

  // Add/remove body class and ESC listener
  useEffect(() => {
    if (active) {
      document.body.classList.add('hacker-mode')
    } else {
      document.body.classList.remove('hacker-mode')
    }
    return () => document.body.classList.remove('hacker-mode')
  }, [active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active) setActive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, setActive])

  // Draggable panel
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* CRT scanline + tint overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 99990,
              background: 'rgba(0, 255, 80, 0.025)',
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
              animation: 'hacker-flicker 0.15s steps(2) infinite',
            }}
          />

          {/* Floating terminal panel */}
          <motion.div
            key="hacker-panel"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              zIndex: 99995,
              width: 280,
              fontFamily: "'Courier New', Courier, monospace",
            }}
            className="glass-panel-strong border border-green/20 overflow-hidden"
          >
            {/* Drag handle header */}
            <div
              onMouseDown={onMouseDown}
              style={{ cursor: 'grab' }}
              className="flex items-center justify-between px-4 py-2 border-b border-green/10 select-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-green"
                  style={{ boxShadow: '0 0 6px #00FF88' }}
                />
                <span className="text-green font-mono text-[10px] tracking-widest uppercase">
                  Hacker Mode
                </span>
              </div>
              <button
                onClick={() => setActive(false)}
                className="text-muted hover:text-warm transition-colors duration-200 text-xs leading-none"
                aria-label="Close hacker mode"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-1">
              <p
                className="font-mono text-[11px] tracking-wider mb-3"
                style={{ color: '#00FF88', textShadow: '0 0 8px #00FF8866' }}
              >
                HACKER MODE ACTIVATED
              </p>

              {STATS.map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <span className="font-mono text-[10px] text-muted">{label}:</span>
                  <span className="font-mono text-[10px] text-green">{value}</span>
                </motion.div>
              ))}

              <p className="font-mono text-[9px] text-muted/50 pt-2 border-t border-white/5 mt-2">
                Press ESC to exit
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
