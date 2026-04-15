import { Navbar } from '@/components/Navbar'
import { Ticker } from '@/components/Ticker'
import { HeroSection } from '@/sections/HeroSection'
import IntakeFlow from '@/components/intake/IntakeFlow'
import { XRaySection } from '@/sections/XRaySection'
import { DossierSection } from '@/sections/DossierSection'
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
        <IntakeFlow />
        <HeroSection />
        <XRaySection />
        <DossierSection />
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
