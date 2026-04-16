'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractInsights, generateContextualChips } from '@/lib/intake/insights'
import type { Message, Act, Synopsis, Insight } from '@/lib/intake/types'

const EASE = [0.16, 1, 0.3, 1] as const
const SYNOPSIS_TOKEN = '[SYNOPSIS_READY]'

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hey, welcome. I'll ask you three quick questions and then build you a working prototype on the spot.\n\nTo start: what's the problem you're trying to solve?",
}

const SUGGESTION_CHIPS = [
  'Client onboarding is a mess',
  'Too much time in my inbox',
  'My team needs a dashboard',
  'I want to launch a new product',
  'Still figuring it out',
]

type Props = {
  onActChange: (act: Act) => void
  onSynopsis: (synopsis: Synopsis, messages: Message[]) => void
  onMessagesChange: (messages: Message[]) => void
  onInsightsChange: (insights: Insight[]) => void
  onQuestionsAnsweredChange: (count: number) => void
}

export default function IntakeChat({
  onActChange,
  onSynopsis,
  onMessagesChange,
  onInsightsChange,
  onQuestionsAnsweredChange,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [act, setAct] = useState<Act>(1)
  const [isFetchingSynopsis, setIsFetchingSynopsis] = useState(false)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [chipsVisible, setChipsVisible] = useState(true)
  const [showContextualChips, setShowContextualChips] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const insights = useMemo(() => extractInsights(messages), [messages])
  const contextualChips = useMemo(
    () => generateContextualChips(messages, insights),
    [messages, insights]
  )

  useEffect(() => { onActChange(act) }, [act, onActChange])
  useEffect(() => { onMessagesChange(messages) }, [messages, onMessagesChange])
  useEffect(() => { onInsightsChange(insights) }, [insights, onInsightsChange])
  useEffect(() => {
    onQuestionsAnsweredChange(questionsAnswered)
  }, [questionsAnswered, onQuestionsAnsweredChange])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isFetchingSynopsis, showContextualChips])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [input])

  useEffect(() => {
    if (window.innerWidth >= 1024) textareaRef.current?.focus()
  }, [])

  const fetchSynopsis = useCallback(
    async (conversationMessages: Message[]) => {
      setIsFetchingSynopsis(true)
      setAct(2)

      try {
        const res = await fetch('/api/intake/synopsis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationMessages.map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        })

        if (!res.ok) throw new Error('Synopsis fetch failed')
        const data = await res.json()
        onSynopsis(data.synopsis, conversationMessages)
      } catch {
        onSynopsis({
          vision:
            'Your business has the potential to operate itself while you focus on growth.',
          agenticWorkflow:
            'AI agents will handle your intake, qualification, follow-up, and reporting.',
          mvpRoadmap: [
            'Step 1: Map your core workflow in Supabase',
            'Step 2: Build your intake UI in React',
            'Step 3: Deploy on Vercel and activate automations',
          ],
          businessType: 'Your Business',
          appSpec: {
            name: 'FlowPilot',
            tagline: 'Automate your core workflow',
            pages: [
              { name: 'Dashboard', description: 'Key metrics overview' },
              { name: 'Intake', description: 'New request capture' },
              { name: 'Pipeline', description: 'Workflow stages' },
              { name: 'Reports', description: 'Analytics' },
            ],
            dataModel: ['Requests', 'Customers', 'Tasks', 'Reports'],
            keyFeatures: ['Automated intake', 'Status tracking', 'Analytics'],
            aesthetic: 'Dark professional with cyan accents',
          },
        }, conversationMessages)
      } finally {
        setIsFetchingSynopsis(false)
      }
    },
    [onSynopsis]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || isTyping || act !== 1) return

      setChipsVisible(false)
      setShowContextualChips(false)
      setInput('')
      setIsTyping(true)

      const userMessage: Message = { role: 'user', content }
      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)

      const userCount = nextMessages.filter((m) => m.role === 'user').length
      setQuestionsAnswered(Math.min(userCount, 3))

      try {
        const res = await fetch('/api/intake/discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content: c }) => ({
              role,
              content: c,
            })),
          }),
        })

        if (!res.ok || !res.body) throw new Error('Stream failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let aiText = ''
        let synopsisTriggered = false

        const aiMessage: Message = { role: 'assistant', content: '' }
        setIsTyping(false)
        setMessages((prev) => [...prev, aiMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          aiText += decoder.decode(value, { stream: true })

          if (!synopsisTriggered && aiText.includes(SYNOPSIS_TOKEN)) {
            synopsisTriggered = true
            const displayText = aiText
              .replace(SYNOPSIS_TOKEN, '')
              .replace(/^\n+/, '')
              .trim()
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: displayText,
              }
              return updated
            })
            continue
          }

          const displayText = aiText
            .replace(SYNOPSIS_TOKEN, '')
            .replace(/^\n+/, '')
            .trim()
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: displayText,
            }
            return updated
          })
        }

        if (!aiText.trim()) {
          throw new Error('Empty response from discovery stream')
        }

        if (!synopsisTriggered) {
          setTimeout(() => setShowContextualChips(true), 400)
        }

        if (synopsisTriggered) {
          const finalMessages = [
            ...nextMessages,
            {
              role: 'assistant' as const,
              content: aiText
                .replace(SYNOPSIS_TOKEN, '')
                .replace(/^\n+/, '')
                .trim(),
            },
          ]
          setTimeout(() => fetchSynopsis(finalMessages), 800)
        }

        if (!synopsisTriggered && userCount >= 6) {
          const finalMessages = [
            ...nextMessages,
            { role: 'assistant' as const, content: aiText.trim() },
          ]
          setTimeout(() => fetchSynopsis(finalMessages), 800)
        }
      } catch (err) {
        setIsTyping(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          const filtered =
            last && last.role === 'assistant' && last.content === ''
              ? prev.slice(0, -1)
              : prev
          return [
            ...filtered,
            {
              role: 'assistant',
              content:
                "Hmm, I didn't catch that. Mind trying again? If this keeps happening, refresh the page.",
            },
          ]
        })
        console.error('Discovery stream failed:', err)
      }
    },
    [isTyping, messages, act, fetchSynopsis]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isTyping && input.trim() && act === 1) sendMessage(input)
    }
  }

  const isInputDisabled = isTyping || act !== 1

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 pt-28 pb-8 lg:px-8 lg:pt-36 lg:pb-10">
        <div className="max-w-xl mx-auto flex flex-col gap-5">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <motion.div
                  key={`${i}-${msg.role}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[14px] leading-[1.75] whitespace-pre-line ${
                      isUser
                        ? 'rounded-br-sm bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--white-warm)]'
                        : 'rounded-bl-sm glass-panel text-[var(--white-muted)]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Initial suggestion chips */}
          {chipsVisible && messages.length === 1 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
              className="flex flex-wrap gap-2.5 mt-2"
            >
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="rounded-full px-4 py-2.5 text-[13px] text-[var(--white-muted)] leading-snug tracking-wide glass-panel hover:border-[var(--cyan)]/30 transition-all duration-300"
                >
                  {chip}
                </button>
              ))}
            </motion.div>
          )}

          {/* Contextual follow-up chips */}
          {showContextualChips &&
            !chipsVisible &&
            contextualChips.length > 0 &&
            act === 1 &&
            !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-wrap gap-2 mt-1"
              >
                {contextualChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="rounded-full px-3.5 py-2 text-[12px] text-[var(--cyan)]/60 leading-snug tracking-wide border border-[var(--cyan)]/10 bg-[var(--cyan)]/[0.03] hover:border-[var(--cyan)]/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--cyan)]/40 shrink-0" />
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-panel rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]/40"
                    style={{
                      animation: `typingPulse 1.4s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Synopsis loading state */}
          {isFetchingSynopsis && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex justify-start"
            >
              <div className="w-full rounded-2xl px-6 py-5 relative overflow-hidden border border-[var(--cyan)]/10 bg-[var(--cyan)]/[0.03]">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 bg-[var(--cyan)]"
                    style={{
                      animation: 'pulse 1s ease-in-out infinite',
                      boxShadow: '0 0 12px var(--cyan-glow)',
                    }}
                  />
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--cyan)]">
                    Building your Game Plan
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {['Analyzing your context...', 'Designing app architecture...', 'Generating prototype spec...'].map(
                    (label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6, duration: 0.4, ease: EASE }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border border-[var(--cyan)]/20 bg-[var(--cyan)]/10">
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]"
                            style={{
                              animation: 'pulse 1.4s ease-in-out infinite',
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-[var(--white-muted)] tracking-wide">
                          {label}
                        </span>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-5 pt-5 pb-20 lg:px-8 lg:pt-6 lg:pb-28 transition-opacity duration-500"
        style={{
          borderTop: '1px solid var(--white-ghost)',
          background:
            'linear-gradient(180deg, rgba(3,3,3,0.90) 0%, rgba(3,3,3,1) 100%)',
          backdropFilter: 'blur(24px)',
          opacity: act !== 1 ? 0.3 : 1,
        }}
      >
        <div className="max-w-xl mx-auto flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            placeholder={
              act === 1
                ? 'Type your answer...'
                : act === 2
                  ? 'Putting your Game Plan together...'
                  : 'Building your prototype...'
            }
            className="flex-1 resize-none rounded-2xl border px-5 py-3.5 text-[14px] text-[var(--white-warm)] placeholder-[var(--white-ghost)] outline-none transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed leading-relaxed bg-white/[0.025] border-white/[0.06] focus:border-[var(--cyan)]/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isInputDisabled || !input.trim()}
            className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-15 disabled:cursor-not-allowed active:scale-95"
            style={{
              background:
                input.trim() && !isInputDisabled
                  ? 'var(--cyan)'
                  : 'rgba(255,255,255,0.04)',
              boxShadow:
                input.trim() && !isInputDisabled
                  ? '0 0 20px var(--cyan-glow), 0 0 40px rgba(0, 240, 255, 0.10)'
                  : 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                color:
                  input.trim() && !isInputDisabled
                    ? 'var(--black-deep)'
                    : '#444',
                transition: 'color 0.2s ease',
              }}
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
