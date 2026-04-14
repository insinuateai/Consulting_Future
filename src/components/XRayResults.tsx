'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'

const EASE = [0.16, 1, 0.3, 1] as const

const GAUGE_R = 58
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_R

export interface XRayResultsProps {
  techStack: string[]
  score: number
  savingsEstimate: number
  workflows: string[]
}

function ReadinessGauge({ score }: { score: number }) {
  const dashTarget = CIRCUMFERENCE * (1 - score / 100)
  const color = score >= 60 ? '#FFB800' : score >= 45 ? '#FFB800' : '#FFB800'

  return (
    <div className="relative inline-flex items-center justify-center" aria-label={`AI readiness score: ${score} out of 100`}>
      <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true">
        {/* Track */}
        <circle
          cx="75" cy="75" r={GAUGE_R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />
        {/* Animated arc */}
        <motion.circle
          cx="75" cy="75" r={GAUGE_R}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashTarget }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.6 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display text-4xl text-amber leading-none">{score}</span>
        <span className="text-lg text-muted leading-none mt-0.5">/100</span>
      </div>
    </div>
  )
}

export function XRayResults({ techStack, score, savingsEstimate, workflows }: XRayResultsProps) {
  const savings = useCountUp(savingsEstimate, 2200)
  const [wfCount, setWfCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWfCount(c => (c < workflows.length ? c + 1 : c))
    }, 400)
    return () => clearInterval(id)
  }, [workflows.length])

  const cardVariants = (i: number) => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.8, ease: EASE },
    },
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6">

      {/* Card 1: Workflows */}
      <motion.div
        className="glass-panel p-6"
        initial="hidden"
        animate="visible"
        variants={cardVariants(0)}
      >
        <div className="font-display text-5xl text-cyan text-glow mb-1">{workflows.length}</div>
        <div className="font-mono text-xs text-muted uppercase tracking-wider mb-5">
          workflows we&apos;d automate
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {workflows.slice(0, wfCount).map((item, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-sm text-warm/80 leading-snug"
              >
                {item}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Card 2: Savings */}
      <motion.div
        className="glass-panel p-6 flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={cardVariants(1)}
      >
        <div className="font-display text-5xl text-cyan text-glow mb-1">
          ${savings.toLocaleString()}
        </div>
        <div className="font-mono text-xs text-muted uppercase tracking-wider mb-5">
          estimated annual savings
        </div>
        <p className="text-xs text-muted mt-auto leading-relaxed">
          Based on {techStack.length} systems detected across your stack
        </p>
      </motion.div>

      {/* Card 3: Readiness Score */}
      <motion.div
        className="glass-panel p-6 flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={cardVariants(2)}
      >
        <ReadinessGauge score={score} />
        <div className="font-mono text-xs text-muted uppercase tracking-wider mt-5 mb-2">
          AI readiness score
        </div>
        <span className="text-amber text-xs font-mono">Significant untapped potential</span>
      </motion.div>

    </div>
  )
}
