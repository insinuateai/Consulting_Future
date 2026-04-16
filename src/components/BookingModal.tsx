'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  'https://calendly.com/kianjquinlan/30min'

const EMBED_URL = `${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=030303&text_color=f0ede6&primary_color=00f0ff`

type Props = {
  open: boolean
  onClose: () => void
}

export function BookingModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          aria-modal="true"
          role="dialog"
          aria-label="Book a call"
        >
          <button
            type="button"
            aria-label="Close booking dialog"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden border border-white/[0.08] bg-[var(--black-deep)] shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-warm transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <iframe
              src={EMBED_URL}
              title="Schedule a call with Insinuate"
              className="w-full h-full border-0"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
