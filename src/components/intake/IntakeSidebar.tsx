'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  extractInsights,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '@/lib/intake/insights'
import type { Insight, InsightCategory, Act } from '@/lib/intake/types'

const EASE = [0.16, 1, 0.3, 1] as const

type Theme = {
  headline: string
  subtext: string
  accentColor: string
  glowColor: string
  tag: string
}

const DEFAULT_THEME: Theme = {
  headline: 'What do you want to build?',
  subtext: 'Start with the problem. We build the system.',
  accentColor: 'var(--cyan)',
  glowColor: 'rgba(0, 240, 255, 0.08)',
  tag: 'AI Strategy & Execution',
}

const KEYWORD_THEMES: { keywords: string[]; theme: Theme }[] = [
  {
    keywords: ['solar', 'energy', 'renewable', 'panel', 'grid'],
    theme: {
      headline: "Harnessing the Sun's Economy",
      subtext: 'Clean energy deserves intelligent systems.',
      accentColor: '#FFB800',
      glowColor: 'rgba(255, 184, 0, 0.08)',
      tag: 'Clean Energy Systems',
    },
  },
  {
    keywords: ['music', 'artist', 'song', 'album', 'band', 'audio'],
    theme: {
      headline: 'Your Sound. Your System.',
      subtext: 'Amplify your reach and automate the business.',
      accentColor: '#A855F7',
      glowColor: 'rgba(168, 85, 247, 0.08)',
      tag: 'Music Industry AI',
    },
  },
  {
    keywords: ['restaurant', 'food', 'menu', 'chef', 'kitchen', 'dining'],
    theme: {
      headline: 'Feed the Experience.',
      subtext: 'From reservations to reorders — automate the ops.',
      accentColor: '#FF006E',
      glowColor: 'rgba(255, 0, 110, 0.08)',
      tag: 'Hospitality Automation',
    },
  },
  {
    keywords: ['fitness', 'gym', 'workout', 'health', 'wellness', 'training'],
    theme: {
      headline: 'Optimize the Machine.',
      subtext: 'Your clients get results. Your business gets scale.',
      accentColor: '#00FF88',
      glowColor: 'rgba(0, 255, 136, 0.08)',
      tag: 'Health & Wellness AI',
    },
  },
  {
    keywords: ['real estate', 'property', 'homes', 'listing', 'rental'],
    theme: {
      headline: 'Every Deal. Automated.',
      subtext: 'Turn lead management into a self-running machine.',
      accentColor: '#3B82F6',
      glowColor: 'rgba(59, 130, 246, 0.08)',
      tag: 'Real Estate Automation',
    },
  },
  {
    keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'product', 'inventory'],
    theme: {
      headline: 'Commerce That Runs Itself.',
      subtext: 'Inventory, orders, and customer flows on autopilot.',
      accentColor: '#FF006E',
      glowColor: 'rgba(255, 0, 110, 0.08)',
      tag: 'Commerce Intelligence',
    },
  },
  {
    keywords: ['healthcare', 'medical', 'clinic', 'patient', 'doctor'],
    theme: {
      headline: 'Care at Scale.',
      subtext: 'Remove friction from patient care.',
      accentColor: '#14B8A6',
      glowColor: 'rgba(20, 184, 166, 0.08)',
      tag: 'Healthcare AI',
    },
  },
  {
    keywords: ['startup', 'founder', 'mvp', 'saas', 'app', 'software', 'platform'],
    theme: {
      headline: 'From Blueprint to Deployment.',
      subtext: 'Ship faster. Automate smarter.',
      accentColor: 'var(--cyan)',
      glowColor: 'rgba(0, 240, 255, 0.08)',
      tag: 'Startup Acceleration',
    },
  },
]

function detectTheme(messages: { role: string; content: string }[]): Theme {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase())
    .join(' ')

  for (const { keywords, theme } of KEYWORD_THEMES) {
    if (keywords.some((kw) => userText.includes(kw))) return theme
  }
  return DEFAULT_THEME
}

function groupInsights(insights: Insight[]): Map<InsightCategory, Insight[]> {
  const groups = new Map<InsightCategory, Insight[]>()
  for (const insight of insights) {
    const existing = groups.get(insight.category) || []
    if (existing.length < 3) {
      existing.push(insight)
      groups.set(insight.category, existing)
    }
  }
  return groups
}

type Props = {
  messages: { role: string; content: string }[]
  act: Act
  questionsAnswered: number
}

export default function IntakeSidebar({ messages, act, questionsAnswered }: Props) {
  const theme = useMemo(() => detectTheme(messages), [messages])
  const insights = useMemo(() => extractInsights(messages), [messages])
  const groupedInsights = useMemo(() => groupInsights(insights), [insights])
  const hasInsights = insights.length > 0

  const actLabels = ['Discovery', 'Game Plan', 'Prototype', 'Strategy']
  const actDescriptions = [
    'Gathering ground-truth data',
    'Architecting your blueprint',
    'Building your prototype',
    'Ready to deploy',
  ]

  return (
    <div
      className="relative flex flex-col justify-between h-full px-7 py-6 lg:px-8 lg:py-7 overflow-hidden"
      style={{ borderRight: '1px solid var(--white-ghost)' }}
    >
      {/* Glow orb */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${theme.glowColor} 0%, transparent 70%)`,
            transition: 'background 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      {/* Top */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[10px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: theme.accentColor }}
          >
            Insinuate
          </span>
          <span
            className="h-px flex-1 max-w-[40px]"
            style={{
              background: `linear-gradient(90deg, ${theme.accentColor}44, transparent)`,
            }}
          />
        </div>

        {/* Act Progress */}
        <div className="flex flex-col gap-1.5 mb-6">
          {[1, 2, 3, 4].map((step) => {
            const isActive = act === step
            const isComplete = act > step
            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-700"
                  style={{
                    background: act >= step ? theme.accentColor : 'rgba(255,255,255,0.08)',
                    boxShadow: isActive ? `0 0 8px ${theme.accentColor}` : 'none',
                  }}
                />
                <span
                  className="text-[11px] tracking-wide transition-all duration-700"
                  style={{
                    color: isActive
                      ? 'var(--white-warm)'
                      : isComplete
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(255,255,255,0.15)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {actLabels[step - 1]}
                </span>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    className="text-[9px] tracking-wider uppercase"
                    style={{ color: theme.accentColor }}
                  >
                    — {actDescriptions[step - 1]}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Headline */}
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3"
            style={{
              background: theme.glowColor,
              border: `1px solid ${theme.accentColor}22`,
            }}
          >
            <span
              className="text-[9px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: theme.accentColor }}
            >
              {theme.tag}
            </span>
          </div>
          <h2 className="text-[20px] font-bold leading-tight mb-2 tracking-[-0.01em] text-[var(--white-warm)]">
            {theme.headline}
          </h2>
          <p className="text-[13px] text-[var(--white-muted)] leading-relaxed max-w-[260px]">
            {theme.subtext}
          </p>
        </div>
      </div>

      {/* Middle: Progress + Insights */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {act === 1 && (
          <div>
            <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3 text-white/[0.18]">
              Discovery Progress
            </p>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3].map((q) => (
                <div
                  key={q}
                  className="h-1 flex-1 rounded-full transition-all duration-700"
                  style={{
                    background:
                      questionsAnswered >= q
                        ? theme.accentColor
                        : 'rgba(255,255,255,0.05)',
                    boxShadow:
                      questionsAnswered >= q
                        ? `0 0 8px ${theme.accentColor}66`
                        : 'none',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mb-6">
              {['Why', 'How', 'Who'].map((label, i) => (
                <span
                  key={label}
                  className="text-[9px] tracking-[0.15em] uppercase transition-colors duration-500"
                  style={{
                    color:
                      questionsAnswered > i
                        ? theme.accentColor
                        : 'rgba(255,255,255,0.12)',
                    fontWeight: questionsAnswered > i ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Live insights */}
            {hasInsights && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="h-px w-full mb-4"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.accentColor}20, transparent)`,
                  }}
                />
                <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3 flex items-center gap-2 text-white/[0.18]">
                  <span
                    className="w-1 h-1 rounded-full inline-block"
                    style={{
                      background: theme.accentColor,
                      boxShadow: `0 0 4px ${theme.accentColor}`,
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                  Live Analysis
                </p>
                <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto">
                  {Array.from(groupedInsights.entries()).map(
                    ([category, categoryInsights]) => (
                      <div key={category}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] opacity-50">
                            {CATEGORY_ICONS[category]}
                          </span>
                          <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-white/[0.25]">
                            {CATEGORY_LABELS[category]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryInsights.map((insight, i) => (
                            <span
                              key={`${insight.text}-${i}`}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-wide"
                              style={{
                                background: `${theme.accentColor}10`,
                                border: `1px solid ${theme.accentColor}20`,
                                color: `${theme.accentColor}cc`,
                              }}
                            >
                              {insight.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {(act === 2 || act === 3) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${theme.accentColor}18`,
              }}
            >
              <p className="text-[9px] text-[#444] tracking-widest uppercase mb-2">
                Status
              </p>
              <p className="text-[12px] text-[var(--white-muted)] leading-relaxed">
                {act === 2
                  ? `Generating your blueprint from ${questionsAnswered} data points gathered.`
                  : 'Building your prototype in real-time.'}
              </p>
            </div>
            {hasInsights && (
              <div className="mt-4">
                <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-2 text-white/[0.15]">
                  {act === 2 ? 'Analyzing' : 'Applied Insights'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {insights.slice(0, 6).map((insight, i) => (
                    <span
                      key={`${insight.text}-${i}`}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px]"
                      style={{
                        background: `${theme.accentColor}08`,
                        border: `1px solid ${theme.accentColor}15`,
                        color: `${theme.accentColor}88`,
                      }}
                    >
                      {insight.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {act === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${theme.accentColor}22`,
              }}
            >
              <p
                className="text-[9px] tracking-widest uppercase mb-2"
                style={{ color: theme.accentColor, opacity: 0.5 }}
              >
                Prototype Ready
              </p>
              <p className="text-[12px] text-[var(--white-muted)] leading-relaxed">
                Your working prototype is live. One call separates you from production.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom */}
      <div className="relative z-10">
        <div
          className="h-px w-full mb-6"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.accentColor}15, transparent)`,
          }}
        />
        <p className="text-[9px] text-[#222] tracking-[0.2em] uppercase">
          Powered by Insinuate.ai
        </p>
      </div>
    </div>
  )
}
