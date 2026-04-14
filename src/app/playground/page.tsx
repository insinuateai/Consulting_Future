import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { PlaygroundSection } from '@/sections/PlaygroundSection'

export const metadata = {
  title: 'Playground — Insinuate.ai',
  description:
    'Interact with production AI agents we shipped: invoice extraction, lead scoring, and support.',
}

export default function PlaygroundPage() {
  return (
    <>
      <Navbar />
      <main className="pb-8">
        <PlaygroundSection />
      </main>
      <Ticker />
    </>
  )
}
