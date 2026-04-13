# CLAUDE.md — Insinuate.ai

## Project Overview
Landing page for Insinuate.ai — an AI consulting agency that builds production AI systems in 48 hours. This site must be the most visually stunning, technologically impressive AI agency site on the internet. The site IS the product demo. Every visitor should feel like they've stepped 5 years into the future. No other agency site should come close.

## Founders
- Builder (Kian): Can build anything technologically advanced in 48 hours with AI orchestration
- Charlie: World-class sales — can sell anything
- Together they offer: Free 60-second Business X-Ray → 48-Hour Proof of Concept → 1-Week AI Residency → Ongoing Scale

## Stack
- Next.js 14 (App Router, src/ directory)
- TypeScript (strict)
- Tailwind CSS v3
- Framer Motion (all animations)
- Three.js via @react-three/fiber + @react-three/drei (3D scenes)
- Lenis (smooth scrolling)
- Deploy target: Vercel

## Design System

### Aesthetic Direction
Dark, cinematic, futuristic. Think: the movie Arrival meets a Bloomberg Terminal meets a Dieter Rams product. NOT generic SaaS. NOT purple gradients. NOT startup template. The vibe is: walking into a command center that controls the future of business. Every pixel should feel deliberate, weighty, and impossibly refined.

### Color Palette (use CSS variables everywhere)
- `--black-deep`: #030303 (page background)
- `--black-surface`: #0A0A0A (card/panel backgrounds)
- `--black-elevated`: #111111 (elevated surfaces)
- `--cyan`: #00F0FF (primary accent — used sparingly for maximum impact)
- `--cyan-glow`: #00F0FF33 (glow/shadow color)
- `--cyan-dim`: #00F0FF15 (very subtle tints)
- `--magenta`: #FF006E (secondary accent — danger/urgency/premium)
- `--white-warm`: #F0EDE6 (primary text)
- `--white-muted`: #F0EDE680 (secondary text)
- `--white-ghost`: #F0EDE620 (borders, dividers)
- `--green`: #00FF88 (success/active/completed states)
- `--amber`: #FFB800 (running/in-progress states)

### Typography
- Display/Headings: "Instrument Serif" (Google Fonts) — elegant, editorial, unexpected for tech
- Data/Labels/Code: "Geist Mono" (Google Fonts or local) — technical, precise
- Body: "Geist Sans" (Google Fonts or local) — clean, modern, readable
- Fallback: use system-ui only as last resort

### Motion Principles
- Everything cinematic — slow, eased, deliberate. Nothing bouncy or playful.
- Default easing: [0.16, 1, 0.3, 1] (custom cubic bezier — smooth deceleration)
- Headline reveals: 1.2-1.8s total with staggered words/lines
- Section reveals: useInView triggers with 0.2 threshold, once: true
- Hover transitions: 0.3-0.4s
- Page transitions: 0.6s
- Parallax: subtle (10-30px range), never aggressive
- Counter animations: 2-3s duration with easeOut

### Atmosphere & Texture
- Global grain overlay on body::after (subtle, opacity 0.03-0.05)
- Glassmorphism panels: backdrop-blur-xl, bg-white/[0.02], border border-white/[0.05]
- Glow effects: box-shadow with cyan-glow, never harsh
- Ambient particle systems where appropriate
- Gradient meshes as section backgrounds (very subtle, dark-to-slightly-less-dark)

### Layout
- Full-bleed sections, min-h-screen for major sections
- Max content width: 1400px, centered
- Generous padding: px-6 md:px-12 lg:px-24
- Section spacing: py-32 md:py-48
- Asymmetric compositions encouraged
- Break the grid occasionally for visual interest

## Site Architecture

### Pages
- `/` — Main landing page (all sections below)
- `/playground` — Interactive AI agent demos (Phase 2)
- `/live` — Build livestream archive (Phase 2)

### Landing Page Sections (in order)
1. **Navbar** — Fixed, transparent → blur on scroll. "Insinuate" logo left, nav links center, "Book a Call" CTA right
2. **Hero** — Full-screen 3D particle field + bold headline + CTAs
3. **Business X-Ray** — Interactive URL analysis tool with animated multi-step reveal
4. **War Room** — Live mission-control dashboard with animated counters and activity feed
5. **Before/After** — Interactive comparison of manual vs AI-powered workflows
6. **Built in 48** — Project showcase cards with timer aesthetic
7. **Blueprint Generator** — 3-question → visual AI architecture blueprint tool
8. **The Model** — How engagement works (X-Ray → 48hr Proof → Residency → Scale)
9. **CTA** — Final call to action, minimal, cinematic
10. **Ticker** — Persistent Bloomberg-style bar across bottom of entire site

### Key URLs
- Calendly: https://calendly.com/kianjquinlan/30min

## Code Conventions
- Write COMPLETE files always. Never partial snippets, never pseudocode, never "// ... rest of component"
- One component per file in src/components/
- Each section in src/sections/
- Shared utilities in src/lib/
- Keep files under 300 lines — split into sub-components if needed
- 'use client' only on components requiring interactivity
- All colors via Tailwind config CSS variables
- All animations via Framer Motion (useInView, motion components, AnimatePresence)
- Responsive: mobile-first, test at 375px, 768px, 1440px
- Accessibility: proper semantic HTML, aria labels on interactive elements
- No console.log in production code
- Prefer named exports for components
