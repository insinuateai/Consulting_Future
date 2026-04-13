# SESSION 6: The Model + CTA + Final Assembly + Polish

Read CLAUDE.md for full context. Replace remaining placeholders and finalize the site.

---

## PART A: src/sections/ModelSection.tsx

How the engagement works — a horizontal timeline/journey.

### Section Header
- id="how"
- Small label: "THE PROCESS"
- Heading: "How We Work" — font-display, large
- Subline: "Four stages. Zero guesswork." — text-muted

### Timeline
- Horizontal on desktop (flex row), vertical on mobile (flex col)
- 4 stages connected by animated lines
- Staggered reveal on scroll (0.2s between each stage)

**Stage 1: "X-Ray"**
- Step number: "01" — font-mono, text-6xl, text-cyan/10 (giant watermark behind)
- Title: "X-Ray" — font-display, text-2xl, text-cyan
- Subtitle: "Free" — font-mono, text-xs, text-green, uppercase, bg-green/10, px-2, py-0.5, rounded-full
- Description: "We analyze your business in 60 seconds. Tech stack, workflows, AI opportunities, estimated ROI. No strings attached." — font-sans, text-sm, text-muted, mt-3, max-w-[250px]
- Duration: "60 seconds" — font-mono, text-xs, text-muted

**Stage 2: "48-Hour Proof"**
- "02", title "48-Hour Proof"
- Subtitle: "Risk-free"
- Description: "We build your highest-impact AI solution — fully working, deployed — before you spend a dollar. You wake up to a Loom video of your problem, solved."
- Duration: "48 hours"

**Stage 3: "Residency"**
- "03", title "Residency"
- Subtitle: "$25K-$75K"
- Description: "One week. We embed in your team, build your entire AI infrastructure, train your people, and leave everything running. Monday to Friday transformation."
- Duration: "1 week"

**Stage 4: "Scale"**
- "04", title "Scale"
- Subtitle: "Custom"
- Description: "Ongoing AI infrastructure management. New automations. Model optimization. Your AI systems get smarter every month."
- Duration: "Ongoing"

### Connecting Lines
- Between each stage: a thin horizontal line (h-px, desktop) or vertical line (w-px, mobile)
- Line color: bg-white/10
- Animated: the line "draws" itself on scroll (width from 0 to 100% with transition, triggered by inView)
- Each line has a small cyan dot at the endpoint that glows on reveal

### Each Stage Card
- .glass-panel, p-8
- On hover: border-cyan/10, subtle translateY(-4px)

---

## PART B: src/sections/CTASection.tsx

Final closing statement. Minimal. Cinematic.

### Layout
- min-h-[70vh], flex flex-col items-center justify-center, text-center, px-6
- Subtle background effect: very faint radial gradient from center (cyan at 2% opacity) creating a spotlight feel

### Content
- Headline: "Ready to see what" (line 1) "48 hours can do?" (line 2) — font-display, text-[clamp(2rem,5vw,4.5rem)], text-warm
- "48 hours" should have text-cyan and text-glow
- Animate: cinematic reveal on scroll, same clip-path technique as hero
- Spacing: mt-10 before CTA
- Primary CTA: "Book Your X-Ray" — bg-cyan, text-deep, font-mono, text-sm, uppercase, tracking-wider, px-10, py-5, rounded-full, hover:glow-cyan, hover:scale-[1.02], transition. Link to Calendly.
- Below button: "15 minutes. No commitment. We'll show you exactly what we'd build." — text-muted, text-sm, mt-6, max-w-md
- Below that: "or email hello@insinuate.ai" — font-mono, text-xs, text-muted/50, mt-4

---

## PART C: Final Assembly — Update src/app/page.tsx

- Remove ALL placeholder components
- Import all real section components:
  ```
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
  ```
- Render in order with proper spacing:
  - Navbar (fixed, outside main flow)
  - main element wrapping all sections
  - pb-8 on last section (space for ticker)
  - Ticker (fixed, outside main flow)

---

## PART D: Polish Checklist — Fix These Issues

After writing all files, verify and fix:

1. **Navbar scroll behavior**: Ensure smooth scroll to section IDs works (scroll-mt-20 on each section for navbar offset)
2. **Mobile responsiveness**: All grids collapse properly. Text sizes scale. Padding adjusts.
3. **Ticker**: Doesn't overlap content on mobile. Maybe hide on mobile (hidden md:block) or make it semi-transparent.
4. **Animation performance**: Add will-change-transform to animated elements. Use transform and opacity only for animations (no layout-triggering properties).
5. **Font loading**: Ensure no FOUT (flash of unstyled text) — use font-display: swap in font config.
6. **Color consistency**: All components use the CSS variable system, no hardcoded hex values.
7. **Hover states**: Every interactive element has a visible hover transition.
8. **Focus states**: All buttons and links have visible focus-visible outlines for accessibility.
9. **Console errors**: No warnings or errors in browser console.

Write ALL files completely. Make sure the entire site works end-to-end with `npm run dev`.
