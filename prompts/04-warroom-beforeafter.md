# SESSION 4: War Room + Before/After Machine

Read CLAUDE.md for full context. Replace both placeholders.

---

## PART A: src/sections/WarRoomSection.tsx

A live mission-control dashboard that proves Insinuate is operational at scale. Looks like Bloomberg Terminal meets NASA command center.

### Section Header
- id="warroom"
- Small label: "LIVE OPERATIONS" with a pulsing green dot (w-2 h-2 rounded-full bg-green animate-pulse inline-block) — font-mono, text-[10px], tracking-[0.3em], uppercase
- Heading: "The War Room" — font-display, text-[clamp(2rem,5vw,4.5rem)], text-warm
- Subline: "What our AI agents are doing right now." — text-muted, mt-4
- Animate all on scroll

### Stats Row (4 cards in a grid)
- Grid: grid-cols-2 lg:grid-cols-4 gap-4, mt-16
- Each card: .glass-panel, p-6, text-center
- All numbers use the useCountUp hook from Session 3, trigger on inView

**Card 1:** "Active Agents" — count to 47, text-green, pulsing green dot beside it
**Card 2:** "Tasks Today" — count to 1,284, text-cyan  
**Card 3:** "Hours Saved" — count to 312, text-cyan
**Card 4:** "ROI Generated" — count to 2,400,000, format as "$2.4M", text-cyan

- Number: font-display, text-4xl md:text-5xl
- Label: font-mono, text-[10px], tracking-[0.3em], uppercase, text-muted, mt-2

### Dashboard Panel (below stats)
- .glass-panel-strong, mt-8, p-6, min-h-[500px]
- Two-column layout: lg:grid-cols-[1fr_380px] gap-6

**Left Column: Live Activity Feed**
- Header: "Live Feed" with a red recording dot (pulsing) — font-mono, text-xs, uppercase, tracking-wider, text-muted, mb-4
- Feed container: max-h-[420px], overflow-hidden (not scrollable — items animate in and old ones push up)
- Feed items appear one by one every 2.5 seconds (useEffect + setInterval)
- Each item is a motion.div that slides in from bottom (y: 20 → 0, opacity 0 → 1):
  - Left: timestamp "14:32:07" — font-mono, text-[10px], text-muted, w-20 shrink-0
  - Center: action description — font-mono, text-sm, text-warm/80, flex-1
  - Right: status badge — small pill, font-mono, text-[9px], uppercase, tracking-wider
    - Completed: bg-green/10 text-green border border-green/20
    - Running: bg-amber/10 text-amber border border-amber/20
    - Queued: bg-white/5 text-muted border border-white/10
- Show max 8 items at once, oldest fade out (AnimatePresence)
- Mock feed items array (at least 20 rotating items):
  ```
  "Invoice processing agent completed batch #4,847 for Client Delta" — completed
  "Lead scoring model recalibrated — 94.2% accuracy achieved" — completed
  "Customer support agent resolved ticket #12,847 in 8s" — completed
  "Data pipeline rebuilt for Client Foxtrot — 12x throughput" — completed
  "Contract analysis agent processing 847 documents" — running
  "Sentiment analysis running on 12K customer reviews" — running
  "Competitor pricing monitor scanning 2,400 SKUs" — running
  "Predictive maintenance model flagged anomaly — Unit 7B" — completed
  "Email campaign optimizer A/B test batch deployed" — running
  "Financial reconciliation agent matched 99.7% of entries" — completed
  "Onboarding flow personalization engine updated" — completed
  "Knowledge base agent indexed 1,247 new documents" — completed
  "Churn prediction model identified 23 at-risk accounts" — completed
  "Supply chain optimizer rerouted 3 shipments — $47K saved" — completed
  "Code review agent scanned 12 PRs — 3 issues flagged" — completed
  "Meeting summarizer processed 8 recordings today" — completed
  "Fraud detection model blocked 4 suspicious transactions" — completed
  "Inventory forecasting updated — 97.3% accuracy" — completed
  "RAG pipeline reindexed 500K documents in 47 minutes" — completed
  "Custom chatbot for Client Hotel handled 2,847 queries" — completed
  ```

**Right Column: Agent Status Panel**
- Header: "Agent Status" — same styling as Live Feed header
- 5 agent cards stacked vertically with gap-3:
  Each agent card: .glass-panel, p-4
  - Agent name: font-mono, text-sm, text-warm — e.g. "Invoice Processor v3.2"
  - Status: inline pill badge (same styling as feed)
  - Stats row: flex justify-between, mt-2, font-mono, text-[10px], text-muted
    - "Uptime: 99.97%"
    - "Tasks: 1,247"
    - "Avg: 3.2s"
  - Subtle progress bar at bottom: thin (h-0.5), bg-white/5, with filled portion in cyan or green

Agent list:
1. "Invoice Processor v3.2" — active, uptime 99.97%, tasks 1,247
2. "Lead Scorer ML-7" — active, uptime 99.91%, tasks 834
3. "Support Agent Delta" — active, uptime 100%, tasks 2,847
4. "Data Pipeline Orchestrator" — active, uptime 99.88%, tasks 456
5. "Contract Analyzer" — running (amber), uptime 98.2%, tasks 89

---

## PART B: src/sections/BeforeAfterSection.tsx

Interactive side-by-side comparison of manual vs AI-powered workflows.

### Section Header
- Small label: "THE TRANSFORMATION" — same styling pattern
- Heading: "See the Difference" — font-display, large
- Subline: "Toggle between how it works now and how it works with us." — text-muted

### Workflow Selector
- Row of 3-4 selectable workflow tabs: font-mono, text-xs, uppercase, tracking-wider
- Options: "Customer Support" | "Invoice Processing" | "Lead Management" | "Data Analysis"
- Active tab: text-cyan, border-b-2 border-cyan
- Inactive: text-muted, hover:text-warm

### Comparison Panel
- Two columns side by side (stacked on mobile)
- Animated transition when switching workflows (AnimatePresence, fade + slight slide)

**Left: "Before" (Manual Process)**
- Header: "BEFORE" — font-mono, text-red-400/60, text-xs, tracking-widest
- .glass-panel with subtle red/warm tint (border-red-400/10)
- A vertical flowchart of 4-6 steps, each step is a row:
  - Step icon: a small circle with step number
  - Step text: font-mono, text-sm
  - Duration badge: "~15 min", "~2 hours", etc. — text-amber, text-xs
  - Connecting lines between steps (thin vertical line, dashed, text-muted/20)
- Bottom summary: "Total: ~4.5 hours" | "Error rate: 12%" | "Cost: $180/day"
- Everything should feel slow, clunky, painful

**Right: "After" (With Insinuate)**
- Header: "AFTER" — font-mono, text-cyan, text-xs, tracking-widest
- .glass-panel with cyan tint (border-cyan/10)
- Same flowchart but:
  - Most steps are collapsed/automated (shown as a single "AI Agent" block with a cyan glow)
  - Only 1-2 human steps remain (marked "Human review — 2 min")
  - Duration badges are dramatically smaller: "0.3s", "instant", "2 min"
  - Connecting lines are solid, cyan
- Bottom summary: "Total: ~3 minutes" | "Error rate: 0.2%" | "Cost: $4/day"
- Everything should feel fast, clean, effortless

### Mock Data for Each Workflow

**Customer Support:**
Before: Ticket received (manual sort 15m) → Assigned to agent (queue 45m) → Agent researches (20m) → Agent drafts response (15m) → Supervisor review (30m) → Sent (2m) = ~2 hours
After: Ticket received → AI triage + classify (0.3s) → AI drafts response with context (1.2s) → Human spot-check (2m) → Auto-sent = ~3 min

**Invoice Processing:**
Before: Email received → Manual download (5m) → Open PDF, read (10m) → Manual data entry (20m) → Cross-reference PO (15m) → Approval routing (2hr) → Payment scheduled (10m) = ~3 hours
After: Email received → AI extracts data (0.5s) → Auto-matched to PO (0.1s) → Flagged for approval (instant) → Auto-scheduled = ~45 seconds

**Lead Management:**
Before: Lead comes in → Manual CRM entry (10m) → Research company (20m) → Score manually (15m) → Assign to rep (30m) → Rep follows up (variable) = hours to days
After: Lead captured → AI enriches + scores (2s) → Auto-routed to best rep (instant) → AI drafts personalized outreach (3s) → Rep reviews + sends (5m) = ~6 min

**Data Analysis:**
Before: Request received → Query database (30m) → Export to Excel (10m) → Manual analysis (2hr) → Create charts (1hr) → Write summary (1hr) → Format report (30m) = ~5 hours
After: Request described in plain English → AI queries + analyzes (8s) → Auto-generates visualizations (3s) → Drafts report (5s) → Human review (10m) = ~11 min

Write both section files completely. Extract sub-components if needed.
