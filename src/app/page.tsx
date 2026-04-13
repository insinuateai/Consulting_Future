import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { HeroSection } from '@/sections/HeroSection'
import { XRaySection } from '@/sections/XRaySection'
import { WarRoomSection } from '@/sections/WarRoomSection'
import { BeforeAfterSection } from '@/sections/BeforeAfterSection'
import { BuiltIn48Section } from '@/sections/BuiltIn48Section'
import { BlueprintSection } from '@/sections/BlueprintSection'
import { ModelSection } from '@/sections/ModelSection'
import { CTASection } from '@/sections/CTASection'

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pb-8">
        <HeroSection />
        <XRaySection />
        <WarRoomSection />
        <BeforeAfterSection />
        <BuiltIn48Section />
        <BlueprintSection />
        <ModelSection />
        <CTASection />
      </main>

      <Ticker />
    </>
  )
}
