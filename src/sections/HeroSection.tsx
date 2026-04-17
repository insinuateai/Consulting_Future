'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ParticleField } from '@/components/ParticleField'

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  // Allow bare domains like "acme.com".
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withProto)
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

export function HeroSection() {
  const [url, setUrl] = useState('')

  const submitXRay = () => {
    const normalized = normalizeUrl(url)
    if (!normalized) return
    // Hand off to XRaySection via hash param — it auto-starts on hashchange.
    window.location.hash = `xray?u=${encodeURIComponent(normalized)}`
    const el = document.getElementById('xray')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="hero"
      className="h-screen w-full relative overflow-hidden"
    >
      {/* Layer 1: Particle field */}
      <div className="absolute inset-0 z-0">
        <ParticleField />
      </div>

      {/* Layer 2: Vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(3,3,3,0.45) 55%, rgba(3,3,3,0.92) 100%)',
        }}
      />

      {/* Layer 3: Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">

        {/* Top label */}
        <motion.p
          className="font-mono text-[11px] tracking-[0.3em] text-cyan uppercase text-glow mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_CINEMATIC }}
        >
          AI Strategy &amp; Execution
        </motion.p>

        {/* Headline */}
        <h1 className="font-display font-normal mb-8 leading-none">
          {/* Line 1 */}
          <div className="overflow-hidden">
            <motion.div
              className="text-[clamp(2.5rem,7vw,7rem)] text-warm"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE_CINEMATIC }}
            >
              We don&apos;t consult.
            </motion.div>
          </div>

          {/* Line 2 */}
          <div className="overflow-hidden">
            <motion.div
              className="text-[clamp(2.5rem,7vw,7rem)] text-warm"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 1.0, ease: EASE_CINEMATIC }}
            >
              We{' '}
              <span className="bg-gradient-to-r from-cyan to-cyan/60 bg-clip-text text-transparent">
                build
              </span>
              .
            </motion.div>
          </div>
        </h1>

        {/* Subline */}
        <motion.p
          className="font-sans text-lg md:text-xl text-muted max-w-xl mx-auto leading-relaxed mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8, ease: 'easeOut' }}
        >
          48 hours from problem to production. No decks. No delays. No bullshit.
        </motion.p>

        {/* Inline X-Ray URL field — the hero IS the first conversion step. */}
        <motion.form
          onSubmit={(e) => {
            e.preventDefault()
            submitXRay()
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2, ease: EASE_CINEMATIC }}
        >
          <label htmlFor="hero-url" className="sr-only">Your company URL</label>
          <input
            id="hero-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="yourcompany.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-cyan/60 outline-none rounded-full px-5 py-3.5 font-mono text-sm text-warm placeholder:text-muted/50 transition-colors"
          />
          <motion.button
            type="submit"
            disabled={!url.trim()}
            className="bg-cyan text-deep font-mono text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            whileHover={url.trim() ? {
              scale: 1.02,
              boxShadow: '0 0 40px rgba(0,240,255,0.35), 0 0 80px rgba(0,240,255,0.12)',
            } : {}}
            transition={{ duration: 0.3 }}
            aria-label="Scan my site with AI"
          >
            Scan My Site →
          </motion.button>
        </motion.form>

        <motion.a
          href="https://calendly.com/kianjquinlan/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-cyan transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.6, ease: EASE_CINEMATIC }}
          aria-label="Book a call instead"
        >
          or book a 30-min call →
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.0, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-cyan/50" />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-cyan/50"
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
