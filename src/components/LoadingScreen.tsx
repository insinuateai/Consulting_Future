'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const
const LETTERS = 'Insinuate'.split('')
const DURATION_MS = 2600

export function LoadingScreen() {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const rafId = useRef<number | undefined>(undefined)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (sessionStorage.getItem('insinuate-loaded')) return
    sessionStorage.setItem('insinuate-loaded', 'true')
    setShow(true)

    startRef.current = performance.now()

    const animate = (now: number) => {
      const p = Math.min((now - startRef.current) / DURATION_MS, 1)
      setProgress(p)
      if (p < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => setDone(true), 400)
      }
    }

    rafId.current = requestAnimationFrame(animate)
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loading"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: '#030303',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Letter-by-letter reveal */}
          <div className="flex items-baseline gap-[1px] mb-10">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.07 + 0.1,
                  duration: 0.7,
                  ease: EASE,
                }}
                className="font-display text-3xl text-warm"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: 160,
              height: 1,
              backgroundColor: 'rgba(240,237,230,0.06)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                backgroundColor: '#00F0FF',
                boxShadow: '0 0 8px rgba(0,240,255,0.6)',
                borderRadius: 1,
                transition: 'width 0.05s linear',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
