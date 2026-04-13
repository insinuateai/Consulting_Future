'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSoundContext } from '@/lib/SoundContext'

export function SoundEngine() {
  const { enabled, toggle } = useSoundContext()
  const [showTooltip, setShowTooltip] = useState(false)

  // Show tooltip on first-ever visit
  useEffect(() => {
    if (!localStorage.getItem('insinuate-sound-hint')) {
      localStorage.setItem('insinuate-sound-hint', 'true')
      setShowTooltip(true)
      const t = setTimeout(() => setShowTooltip(false), 5000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="fixed bottom-12 right-4 z-50 flex flex-col items-end gap-2 md:bottom-10">
      {/* First-visit tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, x: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4 }}
            className="glass-panel px-3 py-1.5 text-right pointer-events-none"
          >
            <span className="font-mono text-[10px] text-muted whitespace-nowrap">
              Enable ambient audio
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={toggle}
        aria-label={enabled ? 'Disable ambient audio' : 'Enable ambient audio'}
        className="glass-panel w-10 h-10 rounded-full flex items-center justify-center
          border border-white/[0.05] hover:border-cyan/20
          text-muted hover:text-warm
          transition-all duration-300"
      >
        {enabled ? <IconSpeaker /> : <IconMuted />}
      </button>
    </div>
  )
}

function IconSpeaker() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="3,5 7,5 11,2 11,14 7,11 3,11" />
      <path d="M13,5.5 C13.8,6.4 14.3,7.2 14.3,8 C14.3,8.8 13.8,9.6 13,10.5" />
    </svg>
  )
}

function IconMuted() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="3,5 7,5 11,2 11,14 7,11 3,11" />
      <line x1="13" y1="6" x2="16" y2="10" />
      <line x1="16" y1="6" x2="13" y2="10" />
    </svg>
  )
}
