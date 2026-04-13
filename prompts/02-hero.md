# SESSION 2: Hero Section — The Jaw Dropper

Read CLAUDE.md for full context. Replace the HeroSection placeholder.

## Create: src/components/ParticleField.tsx
- 'use client' component with a Three.js Canvas
- Render 3000-5000 particles as a Points geometry
- Particle colors: mix of cyan (#00F0FF) at 20% opacity and warm white (#F0EDE6) at 10% opacity
- Particle sizes: randomized between 1-3px, using a custom shader or PointsMaterial with sizeAttenuation
- Initial positions: scattered in a large sphere (radius ~15 units) with some clustering toward center
- Animation: slow constant drift (each particle has a unique velocity vector, very slow — 0.001-0.005 per frame)
- Mouse interaction: useFrame + pointer tracking. Particles gently push away from mouse position in 3D (use raycasting from camera through mouse position). The effect should be subtle — like disturbing smoke, not aggressive repulsion. Influence radius ~3 units, force ~0.01.
- Depth: some particles closer (larger, brighter), most far away (smaller, dimmer) — creates cinematic depth of field feel
- Very subtle rotation of the entire particle system (0.0001 radians/frame on Y axis)
- Background color: transparent (let the page bg show through)
- Camera: perspective, fov 75, position [0, 0, 5]
- No orbit controls — camera is static, particles move
- Performance: use useMemo for geometry, BufferGeometry with Float32Array attributes

## Create: src/sections/HeroSection.tsx
- 'use client' component
- Full viewport: h-screen w-full relative overflow-hidden
- Layer 1 (background): ParticleField component, absolute inset-0, z-0
- Layer 2 (gradient overlay): absolute inset-0, z-1, a very subtle radial gradient from transparent center to black-deep edges (vignette effect using bg-[radial-gradient])
- Layer 3 (content): relative z-10, flex flex-col items-center justify-center h-full text-center px-6
- Content structure:
  1. Top label: "AI STRATEGY & EXECUTION" — font-mono, text-[11px], tracking-[0.3em], text-cyan, uppercase, with text-glow class. Animate: fade in + slide up 20px, duration 0.8s, delay 0.3s
  2. Main headline (two lines):
     - Line 1: "We don't consult." — font-display, text-[clamp(2.5rem,7vw,7rem)], text-warm, font-normal
     - Line 2: "We build." — same styling but with a subtle cyan gradient on "build" (bg-gradient-to-r from-cyan to-cyan/60, bg-clip-text, text-transparent)
     - Animation: Each LINE (not word) reveals with a clip-path animation from inset(0 0 100% 0) to inset(0 0 0% 0), or translateY(100%) to 0 with overflow-hidden wrapper. Staggered: line 1 at 0.5s delay, line 2 at 1.0s delay. Duration 1s each. Easing: cinematic [0.16, 1, 0.3, 1]
  3. Subline: "48 hours from problem to production. No decks. No delays. No bullshit." — font-sans, text-lg md:text-xl, text-muted, max-w-xl mx-auto, leading-relaxed. Animate: fade in, delay 1.8s, duration 1s
  4. CTA row: flex gap-4, mt-10. Animate: fade in + slide up 10px, delay 2.2s
     - Primary: "See What We'd Build You" — bg-cyan text-deep font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-full. Hover: glow-cyan effect, scale(1.02). Links to #xray section
     - Secondary: "Book a Call" — border border-cyan/30 text-cyan font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-full. Hover: border-cyan/80, bg-cyan/5. Links to Calendly
  5. Scroll indicator at bottom: absolute bottom-8, a thin vertical line (w-px h-16 bg-gradient-to-b from-transparent to-cyan/50) with a small dot animating downward. Or a simple chevron with a slow pulse. Fade in at delay 3s.

- All animations use Framer Motion (motion.div with initial/animate/transition)
- The overall feeling: visitor waits through a cinematic 3-second reveal sequence, particles drifting in the background. It should feel like a movie title sequence, not a website loading.

Write BOTH files completely. They should work with the existing foundation from Session 1.
