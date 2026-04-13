'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CX = 100
const CY = 100
const R = 72

const OPPORTUNITIES = [
  { label: 'Customer Support Automation', angle: 55 },
  { label: 'Invoice Processing', angle: 142 },
  { label: 'Lead Scoring & Routing', angle: 218 },
  { label: 'Data Pipeline Optimization', angle: 318 },
]

function dotPos(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
}

export function RadarScan({ active }: { active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    const id = setInterval(() => {
      setCount(c => (c < OPPORTUNITIES.length ? c + 1 : c))
    }, 750)
    return () => clearInterval(id)
  }, [active])

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 justify-center py-4">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Concentric range rings */}
        {[0.33, 0.66, 1].map((f, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R * f}
            fill="none"
            stroke="rgba(0,240,255,0.09)"
            strokeWidth="1"
          />
        ))}

        {/* Crosshair lines */}
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="rgba(0,240,255,0.06)" strokeWidth="1" />
        <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="rgba(0,240,255,0.06)" strokeWidth="1" />

        {/* Center pip */}
        <circle cx={CX} cy={CY} r={3} fill="rgba(0,240,255,0.8)" />

        {/* Rotating sweep arm + glow — uses CSS keyframe radar-spin */}
        {active && (
          <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'radar-spin 2s linear infinite' }}>
            {/* Glow wedge */}
            <line
              x1={CX} y1={CY} x2={CX} y2={CY - R * 0.5}
              stroke="rgba(0,240,255,0.12)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Main sweep line */}
            <line
              x1={CX} y1={CY} x2={CX} y2={CY - R}
              stroke="rgba(0,240,255,0.65)"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Found targets */}
        {OPPORTUNITIES.slice(0, count).map((op, i) => {
          const { x, y } = dotPos(op.angle)
          return (
            <g key={i}>
              {/* Ping ring */}
              <circle cx={x} cy={y} r={5} fill="none" stroke="rgba(0,240,255,0.45)" strokeWidth="1.5">
                <animate attributeName="r" from="5" to="16" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={x} cy={y} r={4.5} fill="rgba(0,240,255,0.9)" />
            </g>
          )
        })}
      </svg>

      {/* Labels */}
      <div className="space-y-3 min-h-[96px]">
        <AnimatePresence>
          {OPPORTUNITIES.slice(0, count).map((op, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 font-mono text-sm text-cyan"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0" />
              {op.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
