# SESSION 7: Sound Design + Easter Eggs + Advanced Polish

Read CLAUDE.md for full context. This session adds the sensory layer that makes the site unforgettable.

---

## PART A: src/components/SoundEngine.tsx

An ambient audio system. Almost no websites use sound — this is a massive differentiator.

### Sound Toggle Button
- Fixed position: bottom-4 right-4 (above ticker on desktop), z-50
- Small circle button: w-10 h-10, .glass-panel, rounded-full, flex items-center justify-center
- Icon: a small SVG speaker icon (on) or muted icon (off) — 16x16, stroke-current, text-muted
- Default state: OFF (sound must be opt-in for UX respect)
- On hover: border-cyan/20, text-warm
- Store state in localStorage key "insinuate-sound"
- Tooltip on first visit: a small floating label "Enable ambient audio" that fades away after 5s

### Audio Implementation
- Use Web Audio API (AudioContext), NOT <audio> elements
- Create a SoundContext provider (src/lib/SoundContext.tsx) so any component can trigger sounds
- Context provides: { enabled: boolean, toggle: () => void, playEffect: (name: string) => void }
- Wrap the app with SoundProvider in layout.tsx

### Ambient Drone (when enabled)
- Generate with Web Audio API oscillators (no external files needed):
  - Two sine oscillators: 55Hz and 82.5Hz (A1 and E2 — a perfect fifth)
  - Very low gain: 0.015 each
  - Subtle LFO modulating gain at 0.1Hz (slow breathing effect)
  - Add a tiny bit of white noise (gain 0.005) filtered through a lowpass at 200Hz
  - Result: a deep, barely-perceptible hum that feels like being inside a machine
- Fade in over 3 seconds when enabled
- Fade out over 2 seconds when disabled

### UI Sound Effects (when enabled)
All generated with Web Audio API (no files):
- **hover**: Very short (50ms) sine blip at 2000Hz, gain 0.02. Triggered on button/link hovers via SoundContext.
- **click**: Short (80ms) click — white noise burst filtered at 4000Hz, gain 0.03
- **xray-scan**: Rising sweep — oscillator frequency 200→2000Hz over 300ms, gain 0.03. Triggered when X-Ray phases change.
- **xray-complete**: Two-tone chime — 800Hz for 100ms then 1200Hz for 150ms, gain 0.04. Triggered on X-Ray completion.
- **ticker-blip**: Tiny 20ms blip at 1500Hz, gain 0.01, triggered randomly every 5-10s from Ticker component.
- **counter-tick**: Rapid tiny blips during counter animations, gain 0.008

### Integration Points
- Add hover sound to: Navbar links, CTA buttons, Blueprint options, Before/After tabs
- Add click sound to: X-Ray analyze button, Blueprint selections, CTA buttons
- Add xray-scan to XRaySection phase transitions
- Add xray-complete to XRaySection Phase 4
- Add ticker-blip to Ticker component randomly
- IMPORTANT: Only add sounds if SoundContext.enabled is true. Check before every play call.

---

## PART B: Easter Eggs

### Konami Code (src/hooks/useKonamiCode.ts)
- Custom hook that listens for the Konami Code sequence: ↑↑↓↓←→←→BA
- On successful entry, returns true
- Use in a component that toggles "Hacker Mode"

### Hacker Mode (src/components/HackerMode.tsx)
- When Konami code is activated, overlay the entire site with a terminal aesthetic:
  - Apply a CSS class to body that:
    - Changes font-family to monospace everywhere
    - Adds a green tint (filter: hue-rotate + saturate)
    - Adds a CRT scanline effect (repeating-linear-gradient on ::before)
    - Adds slight screen flicker (opacity animation 1→0.97→1, very fast)
  - Show a small floating terminal panel (fixed, draggable via mouse) with:
    - "HACKER MODE ACTIVATED" header
    - System stats: "Framework: Next.js 14", "Particles: 4,000", "Animations: 47", "Bundle: 287KB gzipped"
    - "Press ESC to exit"
  - Add scanline overlay: absolute full-screen, repeating-linear-gradient of transparent/rgba(0,0,0,0.03) at 2px intervals
- Toggle off with Escape key or clicking a close button
- Fun detail: the Ticker text changes to l33tsp34k when hacker mode is on

### Hidden /manifesto Route
- Create src/app/manifesto/page.tsx
- Don't link to it from navigation (it's discoverable only by direct URL)
- Simple, beautiful page with editorial layout:
  - Large heading: "The Manifesto" — font-display
  - Body text, beautifully typeset, max-w-2xl, centered:
    ```
    Most AI agencies sell decks.
    We ship systems.

    Most promise transformation in quarters.
    We deliver in days.

    Most have consultants.
    We have engineers.

    Most want retainers.
    We want results.

    We believe the gap between what AI can do
    and what businesses actually use
    is the biggest opportunity of our generation.

    We exist to close that gap.
    Violently fast.

    — Insinuate
    ```
  - Each paragraph reveals on scroll with staggered animation
  - Minimal — just text, grain, and presence
  - A single "Back" link at the bottom: font-mono, text-xs, text-muted

---

## PART C: Advanced Polish

### Custom Cursor (src/components/CustomCursor.tsx)
- 'use client' component, rendered in layout
- Hide default cursor on desktop (cursor: none on body)
- Custom cursor: a small circle (w-4 h-4) that follows mouse with slight lerp delay
- On hover over interactive elements: circle expands to w-10 h-10, border becomes cyan
- On hover over CTA buttons: circle expands further, adds "ENTER" or "→" text inside
- Mobile: completely disabled (detect via matchMedia or window.innerWidth)
- Use requestAnimationFrame for smooth tracking
- mix-blend-mode: difference for visibility on all backgrounds

### Smooth Section Transitions
- Add a subtle parallax to section backgrounds:
  - Each section has a very faint gradient mesh background
  - The mesh shifts slightly on scroll (translateY at 0.1x scroll speed)
  - Creates depth between sections without being distracting

### Loading Screen (src/components/LoadingScreen.tsx)
- Shown for 2-3 seconds on initial page load (or until fonts + 3D loaded)
- Full screen, bg-deep, z-[100]
- Center: "Insinuate" in font-display, text-3xl, with a subtle letter-by-letter reveal
- Below: a thin progress bar, cyan, animating to 100%
- Once complete: slides up and fades out, revealing the hero underneath
- Only shows on first visit (check sessionStorage)
- AnimatePresence for smooth exit

Write ALL files completely. Update layout.tsx and any existing files that need integration.
