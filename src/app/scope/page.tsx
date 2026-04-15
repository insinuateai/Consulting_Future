import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { ScopeCalculator } from '@/components/scope/ScopeCalculator'

export const metadata: Metadata = {
  title: 'Scope & Pay — Insinuate.ai',
  description:
    'Self-serve scope builder for standard engagements under $75K. Pick your automations, pay 50% deposit, kickoff in 24 hours. No sales call required.',
}

export default function ScopePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-[1400px] px-6 py-24 md:px-12 lg:px-24">
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            Self-serve scope & pay
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-6xl">
            Hire us in five minutes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-warm/70">
            Pick your automations. See the real price. Pay 50% deposit.
            Kickoff in 24 hours. This page replaces a six-week sales cycle.
          </p>
        </div>
        <ScopeCalculator />
      </main>
      <Ticker />
    </>
  )
}
