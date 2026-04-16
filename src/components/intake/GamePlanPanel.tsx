'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Message, Synopsis } from '@/lib/intake/types'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  synopsis: Synopsis
  conversationMessages: Message[]
  onBuild: () => void
  onBack: () => void
}

export default function GamePlanPanel({ synopsis, conversationMessages, onBuild, onBack }: Props) {
  const { vision, agenticWorkflow, mvpRoadmap, businessType, appSpec } = synopsis
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const handleEmailSend = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setEmailSending(true)
    try {
      await fetch('/api/intake/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages.map(({ role, content }) => ({ role, content })),
          email: email.trim(),
        }),
      })
      setEmailSent(true)
    } catch {
      // Silent fail — the plan is already on screen
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="mx-auto max-w-4xl space-y-10 px-6 py-16"
    >
      <header className="space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
          Game Plan · {businessType}
        </div>
        <h1 className="font-serif text-4xl leading-tight text-warm md:text-5xl">
          {appSpec.name}
        </h1>
        <p className="text-warm/70 text-lg">{appSpec.tagline}</p>
      </header>

      <Section label="01 · Vision">
        <p className="text-warm/80 text-base leading-relaxed">{vision}</p>
      </Section>

      <Section label="02 · Agentic Workflow">
        <p className="text-warm/80 text-base leading-relaxed">{agenticWorkflow}</p>
      </Section>

      <Section label="03 · MVP Roadmap">
        <ol className="space-y-2">
          {mvpRoadmap.map((step, i) => (
            <li key={i} className="flex gap-3 text-warm/80">
              <span className="font-mono text-xs text-cyan-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section label="04 · App Blueprint">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-warm/40 mb-2">
              Pages
            </div>
            <ul className="space-y-2">
              {appSpec.pages.map((p) => (
                <li key={p.name} className="text-sm text-warm/80">
                  <span className="text-cyan-400">{p.name}</span>
                  <span className="text-warm/50"> — {p.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-warm/40 mb-2">
                Data Model
              </div>
              <div className="flex flex-wrap gap-2">
                {appSpec.dataModel.map((d) => (
                  <span
                    key={d}
                    className="rounded border border-white/10 bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-warm/70"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-warm/40 mb-2">
                Key Features
              </div>
              <ul className="space-y-1 text-sm text-warm/75">
                {appSpec.keyFeatures.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Email capture */}
      <Section label="05 · Get This Emailed">
        {emailSent ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green font-mono"
          >
            Sent. Check your inbox.
          </motion.p>
        ) : (
          <div className="flex gap-3 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSend()}
              placeholder="your@email.com"
              className="flex-1 bg-transparent border-b border-white/10 focus:border-cyan-400/50 outline-none text-warm font-mono text-sm py-2 placeholder:text-warm/20 transition-colors"
            />
            <button
              onClick={handleEmailSend}
              disabled={emailSending || !email.trim()}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400 hover:text-cyan-300 disabled:opacity-30 transition-colors"
            >
              {emailSending ? 'Sending...' : 'Send →'}
            </button>
          </div>
        )}
      </Section>

      <div className="flex flex-wrap items-center gap-4 pt-4">
        <button
          onClick={onBuild}
          className="group relative overflow-hidden rounded border border-cyan-400/60 bg-cyan-400/10 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300 transition hover:bg-cyan-400/20"
        >
          Build the prototype →
        </button>
        <button
          onClick={onBack}
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-warm/50 hover:text-warm"
        >
          ← Back to chat
        </button>
      </div>
    </motion.div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/[0.06] pt-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm/40">
        {label}
      </div>
      {children}
    </section>
  )
}
