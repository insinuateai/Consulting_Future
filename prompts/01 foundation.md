# SESSION 1: Foundation + Design System + Layout Shell

Read CLAUDE.md carefully. Build the entire foundation layer.

## Task 1: tailwind.config.ts
Extend the Tailwind config with:
- All CSS custom properties from the design system (--black-deep through --amber)
- Map them to Tailwind color utilities: colors.deep, colors.surface, colors.elevated, colors.cyan, colors.magenta, colors.warm, colors.muted, colors.ghost, colors.green, colors.amber
- Custom animation timings: transition-timing with a "cinematic" ease [0.16, 1, 0.3, 1]
- Extended font families: display (Instrument Serif), mono (Geist Mono), sans (Geist Sans)
- Custom keyframes: fadeInUp, fadeIn, slideInRight, pulse-glow, grain, ticker-scroll
- Custom backdrop-blur values for glass panels

## Task 2: src/app/globals.css
- Set body background to --black-deep, color to --white-warm
- Add a ::after pseudo-element on body for grain overlay (use an inline SVG noise filter via url("data:image/svg+xml,...") with fractalNoise, opacity 0.035, fixed position, full viewport, pointer-events-none, z-50)
- Define .glass-panel utility class: bg-white/[0.02], backdrop-blur-xl, border border-white/[0.06], rounded-2xl
- Define .glass-panel-strong: same but bg-white/[0.05] and border-white/[0.1]
- Define .glow-cyan: box-shadow 0 0 30px var(--cyan-glow)
- Define .text-glow: text-shadow 0 0 20px var(--cyan-glow)
- Smooth scroll on html
- Selection color: cyan bg with deep black text
- Scrollbar styling: thin, dark, cyan thumb
- Base transitions on all interactive elements

## Task 3: src/lib/fonts.ts
- Export Instrument_Serif from next/font/google (weight 400, display swap, variable --font-display)
- Export Geist_Mono if available from next/font/google, otherwise use Fira Code as fallback (variable --font-mono)
- Export Geist_Sans if available, otherwise use DM Sans as fallback (variable --font-sans)

## Task 4: src/components/SmoothScroll.tsx
- 'use client' component
- Import Lenis from @studio-freight/lenis
- useEffect to initialize Lenis with smooth scrolling, lerp 0.07, duration 1.2
- Handle raf loop with requestAnimationFrame
- Cleanup on unmount
- Render children as-is (wrapper component)

## Task 5: src/app/layout.tsx
- Import fonts from lib/fonts
- Apply font CSS variables to html className
- Metadata: title "Insinuate — AI Strategy & Execution", description "We don't consult. We build. 48 hours from problem to production."
- Wrap body content in SmoothScroll
- Set body className with font-sans, bg-deep, text-warm, antialiased, overflow-x-hidden

## Task 6: src/app/page.tsx
- Import all section components (use placeholder components for now)
- Create placeholder components for each section that render a div with:
  - min-h-screen
  - flex items-center justify-center
  - The section name in Instrument Serif, large, muted color
  - A subtle border-b border-white/5 between sections
- Sections in order: HeroSection, XRaySection, WarRoomSection, BeforeAfterSection, BuiltIn48Section, BlueprintSection, ModelSection, CTASection
- Import and render Navbar and Ticker as persistent elements

## Task 7: src/components/Navbar.tsx (basic version)
- 'use client' — will be enhanced later
- Fixed top-0, z-50, full width
- Transparent bg that transitions to backdrop-blur-xl bg-deep/80 on scroll (use useState + useEffect with scroll listener)
- Left: "Insinuate" in font-display (Instrument Serif), text-xl tracking-tight
- Center: nav links — X-Ray, War Room, Our Work, How We Work (anchor links with smooth scroll)
- Right: "Book a Call" button with cyan border, small, hover:bg-cyan hover:text-deep transition
- Padding: py-4 px-6 md:px-12
- All text in font-mono uppercase tracking-widest text-xs for nav items
- Subtle reveal animation on page load (fade down from -10px)

## Task 8: src/components/Ticker.tsx (basic version)
- 'use client' component
- Fixed bottom-0, z-40, full width
- Height: h-8
- Background: bg-deep/90 backdrop-blur-sm border-t border-white/5
- Infinite scrolling text animation (CSS marquee via translateX keyframe)
- Content: array of mock activity strings like:
  - "Agent #47 completed invoice batch — 2s ago"
  - "$12.4K saved for Client Echo today"
  - "Lead scoring model v3.1 deployed — 99.2% accuracy"
  - "Support agent resolved ticket #9,241 in 4s"
  - "Pipeline optimization: 8.2x throughput increase"
  - "Uptime: 99.97% — 42 agents active"
  - (at least 12 items for a full scroll cycle)
- Text in font-mono, text-[10px], text-muted
- Cyan dot (•) separator between items with text-cyan
- Smooth infinite loop — duplicate the content array for seamless scroll
- Subtle glow on cyan separators

Write every file COMPLETELY. Verify it compiles with `npm run dev`. The page should load with a dark background, grain overlay, smooth scrolling, all placeholder sections visible, navbar at top, ticker at bottom.