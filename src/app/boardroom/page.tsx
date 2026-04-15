import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { BoardRoomLauncher } from '@/components/boardroom/BoardRoomLauncher'

export const metadata: Metadata = {
  title: 'The Board Room — Insinuate.ai',
  description:
    'Watch four AI executives debate your automation strategy in real time. CFO, CMO, CTO, COO — live transcript, structured vote.',
  openGraph: {
    title: 'The Board Room — Insinuate.ai',
    description:
      'Four Claude-powered execs debate your strategy live. Witness agentic executive judgment.',
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ dossier?: string; topic?: string }>
}

export default async function BoardRoomPage({ searchParams }: Props) {
  const { dossier, topic } = await searchParams
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-[1400px] px-6 py-24 md:px-12 lg:px-24">
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            The Board Room
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-6xl">
            Four execs. One decision. Live.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-warm/70">
            A CFO, CMO, CTO, and COO — each a Claude persona with a distinct
            functional lens — debate your topic in real time. They pressure-test
            each other by name. At the end, the board votes.
          </p>
        </div>
        <BoardRoomLauncher defaultDossierSlug={dossier} defaultTopic={topic} />
      </main>
      <Ticker />
    </>
  )
}
