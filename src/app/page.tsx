import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'

function PlaceholderSection({
  id,
  label,
}: {
  id: string
  label: string
}) {
  return (
    <section
      id={id}
      className="min-h-screen flex items-center justify-center border-b border-white/[0.05] relative"
    >
      <span
        className="font-display text-4xl md:text-6xl text-muted select-none"
        aria-hidden="true"
      >
        {label}
      </span>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pb-8">
        <PlaceholderSection id="hero"     label="Hero" />
        <PlaceholderSection id="xray"     label="Business X-Ray" />
        <PlaceholderSection id="warroom"  label="War Room" />
        <PlaceholderSection id="before-after" label="Before / After" />
        <PlaceholderSection id="work"     label="Built in 48" />
        <PlaceholderSection id="blueprint" label="Blueprint Generator" />
        <PlaceholderSection id="model"    label="The Model" />
        <PlaceholderSection id="cta"      label="CTA" />
      </main>

      <Ticker />
    </>
  )
}
