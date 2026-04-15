'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ChatMessage, ConciergeEvent } from '@/lib/concierge/types'

const EASE = [0.16, 1, 0.3, 1] as const
const STORAGE_KEY = 'insinuate:concierge:v1'

interface StoredState {
  messages: ChatMessage[]
  email?: string
}

const SEED: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      "I'm Kian. Real founder, real answers — just faster. Ask anything: pricing, past builds, whether this fits your stack.",
  },
]

export function Concierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(SEED)
  const [email, setEmail] = useState('')
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [toolEvents, setToolEvents] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState
        if (parsed.messages?.length) setMessages(parsed.messages)
        if (parsed.email) setEmail(parsed.email)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, email } satisfies StoredState)
      )
    } catch {}
  }, [messages, email])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, streaming])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setStreaming(true)
    setToolEvents([])
    let assistant = ''
    setMessages([...next, { role: 'assistant', content: '' }])
    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, email: email || undefined }),
      })
      if (!res.ok || !res.body) {
        assistant = `(Error ${res.status} — try again in a bit.)`
      } else {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split('\n\n')
          buf = parts.pop() ?? ''
          for (const p of parts) {
            const line = p.split('\n').find((l) => l.startsWith('data: '))
            if (!line) continue
            try {
              const ev = JSON.parse(line.slice(6)) as ConciergeEvent
              if (ev.type === 'delta') {
                assistant += ev.text
                setMessages((m) => {
                  const copy = [...m]
                  copy[copy.length - 1] = { role: 'assistant', content: assistant }
                  return copy
                })
              } else if (ev.type === 'tool') {
                setToolEvents((t) => [...t, `→ ${ev.name}`])
              } else if (ev.type === 'tool_result') {
                setToolEvents((t) => [...t, `✓ ${ev.name}`])
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      assistant = `(Network hiccup: ${String(err)})`
    } finally {
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', content: assistant || '…' }
        return copy
      })
      setStreaming(false)
    }
  }

  const reset = () => {
    setMessages(SEED)
    setToolEvents([])
  }

  return (
    <>
      <motion.button
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/60 bg-deep/90 text-cyan-300 shadow-[0_0_40px_rgba(0,240,255,0.2)] backdrop-blur-xl transition hover:bg-cyan-400/15"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="font-serif text-xl">{open ? '×' : 'K'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Kian-GPT"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-24 right-6 z-[60] flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-deep/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400">
                  Concierge · live
                </div>
                <div className="font-serif text-lg text-warm">Kian</div>
              </div>
              <button
                onClick={reset}
                className="font-mono text-[10px] uppercase tracking-widest text-warm/50 hover:text-warm"
              >
                Reset
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm leading-relaxed"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === 'user' ? 'text-right' : 'text-left'}
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'inline-block max-w-[82%] rounded-lg rounded-br-sm bg-cyan-400/15 px-3 py-2 text-warm'
                        : 'inline-block max-w-[82%] rounded-lg rounded-bl-sm bg-white/[0.04] px-3 py-2 text-warm/90'
                    }
                  >
                    {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
                  </div>
                </div>
              ))}
              {toolEvents.length > 0 && (
                <div className="pt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">
                  {toolEvents.map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-white/[0.06] px-3 py-3">
              {!email && (
                <input
                  type="email"
                  placeholder="Email (for dossiers, optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-white/[0.06] bg-black/40 px-2 py-1.5 font-mono text-[11px] text-warm placeholder:text-warm/30 focus:border-cyan-400/40 focus:outline-none"
                />
              )}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Ask about pricing, fit, past builds…"
                  disabled={streaming}
                  className="flex-1 rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-warm placeholder:text-warm/30 focus:border-cyan-400/60 focus:outline-none disabled:opacity-60"
                />
                <button
                  onClick={send}
                  disabled={streaming || !input.trim()}
                  className="rounded border border-cyan-400/60 bg-cyan-400/10 px-3 font-mono text-[11px] uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-40"
                >
                  ▸
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
