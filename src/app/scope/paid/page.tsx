import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'

export const metadata: Metadata = {
  title: 'Deposit received — Insinuate.ai',
  description: 'Your engagement is booked. Kickoff in under 24 hours.',
}

export default async function ScopePaidPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>
}) {
  const { scope } = await searchParams
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24 md:px-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
          Deposit received · {scope ?? ''}
        </div>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-6xl">
          Welcome to Insinuate.
        </h1>
        <p className="mt-6 text-lg text-warm/70">
          Kian and Charlie will email you inside the next hour with the
          kickoff calendar invite, the SOW for countersignature, and a
          shared Slack Connect channel. You&apos;ll have working software in
          your hands before the week is out.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded border border-white/[0.1] px-4 py-2 font-mono text-xs uppercase tracking-widest text-warm/70 hover:text-warm"
          >
            ← Back
          </Link>
          <a
            href="https://calendly.com/kianjquinlan/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-cyan-400/60 bg-cyan-400/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300 hover:bg-cyan-400/20"
          >
            Book kickoff →
          </a>
        </div>
      </main>
      <Ticker />
    </>
  )
}
