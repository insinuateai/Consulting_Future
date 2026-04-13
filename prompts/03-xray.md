# SESSION 3: Business X-Ray — The Interactive Analysis Tool

Read CLAUDE.md for full context. Replace the XRaySection placeholder.

This is the #1 conversion tool on the site. A visitor enters their URL and watches an AI analysis unfold in real-time. For now, the analysis is simulated with realistic mock data and timed reveals. The backend API comes later — build the FULL UI and animation system.

## Create: src/sections/XRaySection.tsx

### Section Header
- id="xray" for anchor linking
- Animate on scroll (useInView, once: true)
- Small label: "DIAGNOSTIC" — font-mono, text-[10px], tracking-[0.3em], text-cyan, uppercase, mb-4
- Heading: "Your 60-Second" on line 1, "Business X-Ray" on line 2 — font-display, text-[clamp(2rem,5vw,4.5rem)], text-warm
- Subline: "Enter your URL. Our AI analyzes your tech stack, workflows, and AI opportunities in real-time." — text-muted, max-w-2xl, mt-4

### Input Panel
- .glass-panel, max-w-2xl mx-auto, mt-16, p-8
- URL input: full width, bg-transparent, border-b-2 border-white/10, focus:border-cyan transition, text-warm, font-mono, text-lg, placeholder "https://yourcompany.com", py-3
- Analyze button below input: mt-6, w-full, bg-cyan, text-deep, font-mono, uppercase, tracking-wider, py-4, rounded-xl. Disabled state when empty. Hover: glow effect
- When clicked, transition to analysis mode (hide input panel, show analysis)

### Analysis Sequence (state machine with 5 phases)
Use a state machine (useState with phase enum) and useEffect with timeouts.

**Phase 1: Scanning (0-3s)**
- .glass-panel-strong container, full width, max-w-4xl
- Header: "Scanning website..." with a blinking cyan cursor
- A terminal-style scrolling text effect showing mock scan lines:
  ```
  [00:01] Resolving DNS... ✓
  [00:01] Fetching homepage... ✓
  [00:02] Analyzing DOM structure... ✓
  [00:02] Detecting frameworks... ✓
  [00:03] Scanning API endpoints... ✓
  [00:03] Mapping user flows... ✓
  ```
- Lines appear one by one with a 400ms interval
- Each line starts with muted timestamp, text in font-mono text-sm text-muted, checkmark in text-green
- Subtle progress bar below (thin line, cyan, animating from 0-25%)

**Phase 2: Tech Stack (3-5s)**
- Header changes to "Tech stack identified"
- Progress bar: 25-50%
- Display 6 mock tech icons/badges in a flex-wrap grid, appearing one by one with staggered scale-in animation:
  - React, AWS, PostgreSQL, Stripe, Vercel, HubSpot (use text labels in small glass-panel badges since we can't load external icons)
- Each badge: .glass-panel, px-3 py-1.5, font-mono text-xs, border-cyan/20
- Below: "4 integration points identified" — text-cyan, font-mono, text-sm

**Phase 3: AI Opportunities (5-8s)**
- Header: "Identifying AI opportunities..."
- Progress: 50-75%
- A radar/scan effect: create a circular SVG animation — a rotating line sweeping around a circle (like a radar ping), with dots appearing at "found" positions. Use SVG + CSS animation. Size: 200x200px centered.
- As radar sweeps, "opportunities" appear as labels around it:
  - "Customer Support Automation"
  - "Invoice Processing"
  - "Lead Scoring & Routing"
  - "Data Pipeline Optimization"

**Phase 4: Results (8-11s)**
- Header: "Analysis Complete" — text-green
- Progress: 100% — bar glows cyan
- Three result cards appear staggered (0.3s between each), arranged in a responsive grid (1 col mobile, 3 col desktop):

**Card 1: "Workflows to Automate"**
- .glass-panel, p-6
- Large number: "4" — font-display, text-5xl, text-cyan, text-glow
- Label: "workflows we'd automate" — font-mono, text-xs, text-muted, uppercase, tracking-wider
- List items appear one by one (0.4s interval):
  - "Customer inquiry routing → AI triage agent"
  - "Invoice data extraction → Automated pipeline"
  - "Lead scoring → Predictive ML model"
  - "Report generation → Scheduled AI drafts"
- Each item: font-mono, text-sm, text-warm/80, with a cyan "→" separator

**Card 2: "Estimated Annual Savings"**
- .glass-panel, p-6
- Large number with count-up animation from $0 to $247,000: font-display, text-5xl, text-cyan, text-glow
- Use a custom hook or inline counter that increments over 2s with easeOut
- Format with $ and commas
- Label: "estimated annual savings" — same label styling
- Breakdown text: "Based on current headcount and workflow analysis" — text-xs, text-muted

**Card 3: "AI Readiness Score"**
- .glass-panel, p-6
- Animated arc/gauge: SVG circle (stroke-dasharray animation from 0 to 34%), 150px diameter
- Score: "34" — font-display, text-5xl, text-amber (it's low on purpose — creates urgency), centered inside the arc
- "/100" — text-lg, text-muted
- Label: "AI readiness score" — same styling
- Below: "Significant untapped potential" — text-amber, text-xs, font-mono

**Phase 5: CTA (11s+)**
- Below cards: a final message fades in
- "This is a surface-level scan. Imagine what a full analysis reveals." — font-display, text-2xl, text-warm, text-center, mt-12
- CTA button: "Get Your Full X-Ray — Free" — same cyan button style as hero, links to Calendly
- Subtle: "Takes 15 minutes. No commitment." — text-muted, text-sm, mt-3

### Technical Notes
- Extract the counter animation into src/hooks/useCountUp.ts (reusable hook: takes target, duration, returns current value)
- Extract the terminal text effect into src/components/TerminalText.tsx
- The radar SVG can be its own component src/components/RadarScan.tsx
- Ensure the entire sequence can be re-triggered (add a "Scan Another" button after results that resets state)
- All animations use Framer Motion where possible, CSS keyframes for the radar rotation and progress bar

Write ALL files completely. Each file under 300 lines.
