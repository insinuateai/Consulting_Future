'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SUPPORT_KB,
  SUPPORT_CONVERSATIONS,
  type SupportPrompt,
} from '@/lib/playgroundAgents'
import { useSoundContext } from '@/lib/SoundContext'

const EASE = [0.16, 1, 0.3, 1] as const

interface ChatMessage {
  id: string
  role: 'agent' | 'user'
  text: string
  citations: string[]
  streaming?: boolean
}

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'agent',
  text: "Hi — I'm the Helios Cloud support agent. Ask me anything about billing, the API, or SSO. Every answer links straight to the knowledge-base article it came from.",
  citations: [],
}

function renderWithCitations(
  text: string,
  citations: string[],
  highlightedKb: string | null,
  onHover: (kbId: string | null) => void,
) {
  const parts = text.split(/(\[\d+\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return <span key={i}>{part}</span>
    const idx = parseInt(match[1], 10) - 1
    const kbId = citations[idx]
    if (!kbId) return <span key={i}>{part}</span>
    const active = highlightedKb === kbId
    return (
      <sup
        key={i}
        onMouseEnter={() => onHover(kbId)}
        onMouseLeave={() => onHover(null)}
        className={`inline-block mx-0.5 font-mono text-[10px] px-1 rounded cursor-pointer transition-all duration-200 ${
          active
            ? 'text-deep bg-cyan'
            : 'text-cyan bg-cyan/10 hover:bg-cyan/20'
        }`}
      >
        {match[1]}
      </sup>
    )
  })
}

export function SupportAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [activeCitations, setActiveCitations] = useState<string[]>([])
  const [highlightedKb, setHighlightedKb] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set())
  const threadRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { playEffect } = useSoundContext()

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const ask = (convo: SupportPrompt) => {
    if (streaming) return
    clearTimers()
    playEffect('click')
    setAskedIds((prev) => new Set(prev).add(convo.id))

    const userMsg: ChatMessage = {
      id: `${convo.id}-user`,
      role: 'user',
      text: convo.prompt,
      citations: [],
    }
    const agentId = `${convo.id}-agent`
    const agentMsg: ChatMessage = {
      id: agentId,
      role: 'agent',
      text: '',
      citations: convo.citations,
      streaming: true,
    }
    setMessages((prev) => [...prev, userMsg, agentMsg])
    setStreaming(true)

    // Reveal citations progressively as they appear in text
    const tokens = convo.answer.split(/(\s+)/)
    let idx = 0
    const revealedCiteKbs = new Set<string>()

    const tick = () => {
      if (idx >= tokens.length) {
        setStreaming(false)
        setMessages((prev) =>
          prev.map((m) => (m.id === agentId ? { ...m, streaming: false } : m))
        )
        playEffect('xray-complete')
        return
      }
      const next = tokens[idx]
      idx += 1
      setMessages((prev) =>
        prev.map((m) => (m.id === agentId ? { ...m, text: m.text + next } : m))
      )
      // Detect citation markers
      const citeMatch = next.match(/\[(\d+)\]/)
      if (citeMatch) {
        const ci = parseInt(citeMatch[1], 10) - 1
        const kbId = convo.citations[ci]
        if (kbId && !revealedCiteKbs.has(kbId)) {
          revealedCiteKbs.add(kbId)
          setActiveCitations((prev) => (prev.includes(kbId) ? prev : [...prev, kbId]))
          setHighlightedKb(kbId)
          timers.current.push(setTimeout(() => setHighlightedKb(null), 900))
        }
      }
      timers.current.push(setTimeout(tick, 28))
    }

    timers.current.push(setTimeout(tick, 300))
  }

  const remaining = SUPPORT_CONVERSATIONS.filter((c) => !askedIds.has(c.id))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
      {/* Chat */}
      <div className="glass-panel-strong p-5 flex flex-col h-[540px]">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/5">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Helios Cloud · Support Agent
          </p>
        </div>

        <div
          ref={threadRef}
          className="flex-1 overflow-y-auto space-y-3 pr-2"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={[
                    'max-w-[88%] rounded-lg px-4 py-3 font-sans text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-cyan/10 border border-cyan/20 text-warm'
                      : 'bg-white/[0.03] border border-white/5 text-warm',
                  ].join(' ')}
                >
                  {renderWithCitations(m.text, m.citations, highlightedKb, setHighlightedKb)}
                  {m.streaming && <span className="text-cyan animate-pulse">▋</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Suggested prompts */}
        <div className="pt-4 mt-3 border-t border-white/5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">
            Suggested prompts
          </p>
          {remaining.length === 0 ? (
            <p className="font-mono text-xs text-muted">
              All demo prompts used.{' '}
              <button
                onClick={() => {
                  setMessages([GREETING])
                  setActiveCitations([])
                  setAskedIds(new Set())
                }}
                className="text-cyan hover:text-warm transition-colors"
              >
                Reset conversation
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {remaining.map((c) => (
                <button
                  key={c.id}
                  disabled={streaming}
                  onClick={() => ask(c)}
                  onMouseEnter={() => playEffect('hover')}
                  className="glass-panel px-3 py-2 font-mono text-[11px] text-warm hover:border-cyan/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  {c.prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Knowledge base */}
      <div className="glass-panel p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan mb-4">
          Knowledge base
        </p>
        <div className="space-y-2">
          {SUPPORT_KB.map((art) => {
            const cited = activeCitations.includes(art.id)
            const highlighted = highlightedKb === art.id
            return (
              <motion.div
                key={art.id}
                onMouseEnter={() => setHighlightedKb(art.id)}
                onMouseLeave={() => setHighlightedKb(null)}
                animate={
                  highlighted
                    ? { boxShadow: '0 0 20px rgba(0,240,255,0.35)' }
                    : { boxShadow: '0 0 0px rgba(0,240,255,0)' }
                }
                transition={{ duration: 0.3 }}
                className={[
                  'p-3 rounded border transition-colors duration-300',
                  highlighted
                    ? 'border-cyan bg-cyan/5'
                    : cited
                    ? 'border-cyan/40 bg-white/[0.02]'
                    : 'border-white/5 bg-white/[0.01]',
                ].join(' ')}
              >
                <p className="font-mono text-xs text-warm leading-tight">{art.title}</p>
                <p className="font-sans text-[11px] text-muted leading-relaxed mt-1">
                  {art.snippet}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
