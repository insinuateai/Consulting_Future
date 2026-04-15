import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { BuildLauncher } from '@/components/buildapp/BuildLauncher'

export const metadata: Metadata = {
  title: 'Build Me One Right Now — Insinuate.ai',
  description:
    'Describe an app in one sentence. Claude Opus 4.6 writes the code live, deploys it, hands you the URL. 90 seconds. No call required.',
  openGraph: {
    title: 'Build Me One Right Now — Insinuate.ai',
    description:
      'The first consulting firm that ships a working prototype before the sales call.',
    type: 'website',
  },
}

export default function BuildPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-[1400px] px-6 py-24 md:px-12 lg:px-24">
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            Build me one right now
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-6xl">
            Describe an app. Watch it appear.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-warm/70">
            One sentence in. A working prototype out — live URL, source
            viewable, ready to share. Every other firm will send a deck.
            We send the thing itself.
          </p>
        </div>
        <BuildLauncher />
      </main>
      <Ticker />
    </>
  )
}
