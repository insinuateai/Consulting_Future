import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { HireForm } from '@/components/employee/HireForm'

export const metadata: Metadata = {
  title: 'Hire a Digital Employee — Insinuate.ai',
  description:
    'Describe one recurring task. A named AI employee starts working today — for free, for 7 days. Real output, not a demo.',
}

export default function HirePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-24 md:px-12">
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            Digital Employee · 7-day trial
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-6xl">
            Hire someone. Today.
          </h1>
          <p className="mt-6 text-lg text-warm/70">
            You describe one recurring task. Five minutes later, a named
            AI employee is in your inbox doing the work — real output, not
            a demo. Seven days free, $499/month after if you keep them.
          </p>
        </div>
        <HireForm />
      </main>
      <Ticker />
    </>
  )
}
