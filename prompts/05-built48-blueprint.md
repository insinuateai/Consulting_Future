# SESSION 5: Built in 48 + Blueprint Generator

Read CLAUDE.md for full context. Replace both placeholders.

---

## PART A: src/sections/BuiltIn48Section.tsx

Showcase of builds with a timer/stopwatch aesthetic. Each card proves speed.

### Section Header
- id="work"
- Small label: "CASE STUDIES" — standard styling
- Heading: "Built in 48" — font-display, large
- Subline: "Real problems. Real solutions. Measured in hours, not months." — text-muted

### Project Grid
- Grid: grid-cols-1 md:grid-cols-2 gap-6, mt-16, max-w-5xl mx-auto
- 4 project cards, staggered reveal on scroll (0.15s between each)

Each card: .glass-panel, p-8, hover:border-cyan/20 transition-all duration-500, group

**Card Layout:**
- Top row: flex justify-between items-start
  - Left: Project type badge — font-mono, text-[9px], uppercase, tracking-widest, text-cyan, bg-cyan/5, px-3, py-1, rounded-full, border border-cyan/10
  - Right: Timer display — font-mono, text-2xl, text-cyan, text-glow. Format: "32:15:47" (like HH:MM:SS stopwatch). On hover, the timer does a subtle pulse animation.
- Problem statement: mt-6, font-display, text-xl, text-warm — one clear sentence
- Solution statement: mt-3, font-sans, text-sm, text-muted, leading-relaxed — one clear sentence
- Divider: mt-6, h-px, bg-white/5, group-hover:bg-cyan/10 transition
- Bottom row: mt-6, flex justify-between items-end
  - Left: tech badges in a flex-wrap gap-2 — each badge font-mono text-[9px] text-muted bg-white/5 px-2 py-1 rounded
  - Right: result metric — font-mono, text-sm, text-green. Bold number.

**Card Data:**

Card 1:
- Type: "CUSTOMER SUPPORT"
- Timer: "16:42:33"
- Problem: "A SaaS company was spending $340K/year on a 12-person support team with 4-hour response times."
- Solution: "We built an AI support agent that resolves 73% of tickets autonomously in under 30 seconds."
- Tech: Claude API, RAG, Pinecone, Next.js, Twilio
- Result: "$247K saved annually"

Card 2:
- Type: "FINANCIAL OPERATIONS"
- Timer: "23:08:15"
- Problem: "A logistics firm processed 2,000 invoices monthly by hand — 3 FTEs, 12% error rate."
- Solution: "We deployed an extraction pipeline that processes invoices in 0.4 seconds with 99.8% accuracy."
- Tech: GPT-4 Vision, AWS Lambda, PostgreSQL, n8n
- Result: "12x faster processing"

Card 3:
- Type: "SALES INTELLIGENCE"
- Timer: "41:22:07"
- Problem: "A B2B startup's sales team spent 60% of their time researching leads instead of selling."
- Solution: "We built an AI research agent that enriches, scores, and drafts personalized outreach for every lead."
- Tech: Claude API, Clearbit, Apollo, Slack API, Python
- Result: "3.2x pipeline increase"

Card 4:
- Type: "DATA INFRASTRUCTURE"
- Timer: "47:55:12"
- Problem: "A healthcare company needed to migrate and reconcile 5 years of patient data across 3 legacy systems."
- Solution: "We built an AI-powered ETL pipeline that mapped, cleaned, and migrated 2.3M records with full audit trail."
- Tech: Python, dbt, Snowflake, Claude API, Airflow
- Result: "2.3M records migrated"

---

## PART B: src/sections/BlueprintSection.tsx

An interactive 3-question tool that generates a visual AI architecture blueprint.

### Section Header
- Small label: "YOUR BLUEPRINT"
- Heading: "What Would We Build You?" — font-display, large
- Subline: "Answer 3 questions. Get a custom AI architecture in 30 seconds." — text-muted

### Question Flow (state machine: question1 → question2 → question3 → generating → result)
- Center-aligned, max-w-2xl mx-auto
- .glass-panel-strong, p-10, mt-16

**Question 1: "What's your biggest operational bottleneck?"**
- 5 option cards in a grid (grid-cols-1 sm:grid-cols-2 gap-3, with the 5th centered):
  - "Customer Support" — icon placeholder: 💬
  - "Data Processing" — 📊
  - "Sales & Lead Gen" — 🎯
  - "Content & Marketing" — ✍️
  - "Internal Operations" — ⚙️
- Each option: .glass-panel, p-4, cursor-pointer, text-center, hover:border-cyan/30, transition
- Selected state: border-cyan, bg-cyan/5
- Font-mono, text-sm for label
- On select, animate to question 2 (AnimatePresence, slide left + fade)

**Question 2: "How much time does your team spend on this weekly?"**
- 4 options in a row:
  - "< 10 hours"
  - "10-30 hours"
  - "30-80 hours"
  - "80+ hours"
- Same card styling, single row (flex, wrapped on mobile)

**Question 3: "What's your team size?"**
- 4 options:
  - "Just me"
  - "2-10 people"
  - "11-50 people"
  - "50+ people"

**Generating Phase (2-3 seconds)**
- Centered loading state
- Text: "Generating your blueprint..." — font-mono, text-cyan, with blinking cursor
- A subtle spinning/pulsing geometric shape (CSS only — rotating square outline, border-cyan, animate-spin slow)
- Progress dots or bar

**Result: The Blueprint**
- AnimatePresence transition in
- .glass-panel-strong, p-8, max-w-4xl mx-auto

The blueprint is a visual architecture diagram built with styled divs (NOT an image):

- Title: "Your AI Blueprint" — font-display, text-2xl, text-cyan
- Subtitle: dynamically assembled from answers, e.g. "Customer Support Automation for a 11-50 Person Team" — font-mono, text-sm, text-muted

- Architecture diagram:
  - Top row: "Data Sources" box → arrow → "AI Processing Layer" box → arrow → "Output Layer" box
  - Each box is a .glass-panel with specific content based on Q1 answer
  - Arrows: simple → characters or thin lines with cyan color
  - Below the main flow: 2-3 "supporting systems" boxes connected with dotted lines

- For Customer Support Q1 selection:
  - Sources: "Tickets, Emails, Chat, Knowledge Base"
  - Processing: "Triage Agent → Resolution Agent → Escalation Router"
  - Output: "Auto-responses, Summaries, Analytics Dashboard"
  - Supporting: "Vector DB (RAG)", "Fine-tuned LLM", "Human-in-loop Queue"

- Metrics panel below diagram:
  - Estimated build time: "32-48 hours" — text-cyan
  - Estimated savings: "$180K-$340K/year" — text-green
  - Automation rate: "65-80%" — text-cyan
  - (Values vary based on Q2 and Q3 answers — larger team + more hours = bigger numbers)

- CTA below: "Let's Build This" → Calendly link
- Secondary: "Download Blueprint" (not functional yet — just shows "Coming soon" toast)

### Data Logic (simple mapping)
Create a data object in src/lib/blueprintData.ts that maps Q1 answers to:
- Architecture components (sources, processing, outputs, supporting)
- Base metrics that get multiplied by Q2 (hours) and Q3 (team size) factors:
  - Q2 multipliers: <10h = 0.5x, 10-30h = 1x, 30-80h = 2x, 80+ = 3.5x
  - Q3 multipliers: solo = 0.3x, 2-10 = 1x, 11-50 = 2.5x, 50+ = 5x
  - Apply to savings estimate: base $100K × Q2 × Q3, capped at $2M

Write ALL files completely. Extract blueprintData.ts to src/lib/.
