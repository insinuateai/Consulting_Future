'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

interface Project {
  type: string
  timer: string
  problem: string
  solution: string
  tech: string[]
  result: string
}

const PROJECTS: Project[] = [
  {
    type: 'CUSTOMER SUPPORT',
    timer: '16:42:33',
    problem:
      'A SaaS company was spending $340K/year on a 12-person support team with 4-hour response times.',
    solution:
      'We built an AI support agent that resolves 73% of tickets autonomously in under 30 seconds.',
    tech: ['Claude API', 'RAG', 'Pinecone', 'Next.js', 'Twilio'],
    result: '$247K saved annually',
  },
  {
    type: 'FINANCIAL OPERATIONS',
    timer: '23:08:15',
    problem:
      'A logistics firm processed 2,000 invoices monthly by hand — 3 FTEs, 12% error rate.',
    solution:
      'We deployed an extraction pipeline that processes invoices in 0.4 seconds with 99.8% accuracy.',
    tech: ['GPT-4 Vision', 'AWS Lambda', 'PostgreSQL', 'n8n'],
    result: '12x faster processing',
  },
  {
    type: 'SALES INTELLIGENCE',
    timer: '41:22:07',
    problem:
      "A B2B startup's sales team spent 60% of their time researching leads instead of selling.",
    solution:
      'We built an AI research agent that enriches, scores, and drafts personalized outreach for every lead.',
    tech: ['Claude API', 'Clearbit', 'Apollo', 'Slack API', 'Python'],
    result: '3.2x pipeline increase',
  },
  {
    type: 'DATA INFRASTRUCTURE',
    timer: '47:55:12',
    problem:
      'A healthcare company needed to migrate and reconcile 5 years of patient data across 3 legacy systems.',
    solution:
      'We built an AI-powered ETL pipeline that mapped, cleaned, and migrated 2.3M records with full audit trail.',
    tech: ['Python', 'dbt', 'Snowflake', 'Claude API', 'Airflow'],
    result: '2.3M records migrated',
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.15 }}
      className="glass-panel p-8 group hover:border-cyan/20 transition-all duration-500 flex flex-col"
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="font-mono text-[9px] uppercase tracking-widest text-cyan bg-cyan/5 px-3 py-1 rounded-full border border-cyan/10">
          {project.type}
        </span>

        <motion.span
          className="font-mono text-2xl text-cyan text-glow tabular-nums"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.3 }}
          style={{
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          {project.timer}
        </motion.span>
      </div>

      {/* Problem */}
      <p className="mt-6 font-display text-xl text-warm leading-snug">
        {project.problem}
      </p>

      {/* Solution */}
      <p className="mt-3 font-sans text-sm text-muted leading-relaxed">
        {project.solution}
      </p>

      {/* Divider */}
      <div className="mt-6 h-px bg-white/5 group-hover:bg-cyan/10 transition-colors duration-500" />

      {/* Bottom row */}
      <div className="mt-6 flex justify-between items-end flex-1">
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="font-mono text-[9px] text-muted bg-white/5 px-2 py-1 rounded"
            >
              {t}
            </span>
          ))}
        </div>

        <span className="font-mono text-sm text-green font-bold whitespace-nowrap ml-4">
          {project.result}
        </span>
      </div>
    </motion.div>
  )
}

export function BuiltIn48Section() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 })

  return (
    <section
      id="work"
      className="min-h-screen py-32 md:py-48 px-6 md:px-12 lg:px-24 border-b border-white/[0.05] relative scroll-mt-20"
    >
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 80% 30%, rgba(0,240,255,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan mb-4">
            Case Studies
          </p>

          <h2 className="font-display text-5xl md:text-7xl text-warm">
            Built in 48
          </h2>

          <p className="mt-4 font-sans text-base text-muted max-w-xl">
            Real problems. Real solutions. Measured in hours, not months.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.type} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
