import type { SwarmAgent } from './types'

/**
 * The 20-agent swarm. Lanes are visualized as columns in the live UI:
 *
 *   INTEL (recon)    →    ANALYSIS (synthesis)    →    STRATEGY (proposals)    →    OUTPUT (deliverables)
 *
 * Each agent has a real Claude prompt in `runAgent()`. None of this is theater —
 * every "thought" the user sees is real Claude streaming output.
 */
export const SWARM_AGENTS: SwarmAgent[] = [
  // ---- INTEL LANE — fast recon, mostly Haiku ----------------------------------
  {
    slug: 'site-scout',
    name: 'Site Scout',
    role: 'Front-end recon',
    mission: 'Reading the homepage, hero copy, and primary CTAs',
    lane: 'intel',
    order: 1,
  },
  {
    slug: 'pricing-hunter',
    name: 'Pricing Hunter',
    role: 'Revenue intel',
    mission: 'Finding pricing, packaging, and conversion levers',
    lane: 'intel',
    order: 2,
  },
  {
    slug: 'blog-listener',
    name: 'Blog Listener',
    role: 'Voice & content audit',
    mission: 'Sampling recent posts to learn voice and topic strategy',
    lane: 'intel',
    order: 3,
  },
  {
    slug: 'careers-prospector',
    name: 'Careers Prospector',
    role: 'Hiring signal',
    mission: 'Reading job postings to infer team shape and priorities',
    lane: 'intel',
    order: 4,
  },
  {
    slug: 'changelog-archivist',
    name: 'Changelog Archivist',
    role: 'Velocity reader',
    mission: 'Mining recent product updates for shipping cadence',
    lane: 'intel',
    order: 5,
  },
  {
    slug: 'tech-detective',
    name: 'Tech Detective',
    role: 'Stack fingerprinting',
    mission: 'Identifying every SaaS, framework, and integration in use',
    lane: 'intel',
    order: 6,
  },

  // ---- ANALYSIS LANE — Sonnet, deeper synthesis -------------------------------
  {
    slug: 'industry-classifier',
    name: 'Industry Classifier',
    role: 'Vertical placement',
    mission: 'Pinning the company on a vertical map and stage',
    lane: 'analysis',
    order: 1,
  },
  {
    slug: 'icp-modeler',
    name: 'ICP Modeler',
    role: 'Customer profile',
    mission: 'Reverse-engineering the ideal customer profile from copy',
    lane: 'analysis',
    order: 2,
  },
  {
    slug: 'pain-cartographer',
    name: 'Pain Cartographer',
    role: 'Workflow forensics',
    mission: 'Mapping where revenue leaks and time bleeds',
    lane: 'analysis',
    order: 3,
  },
  {
    slug: 'moat-evaluator',
    name: 'Moat Evaluator',
    role: 'Defensibility lens',
    mission: 'Measuring asymmetric strengths to amplify',
    lane: 'analysis',
    order: 4,
  },
  {
    slug: 'tone-mirror',
    name: 'Tone Mirror',
    role: 'Brand voice match',
    mission: 'Locking the dossier voice to the company brand',
    lane: 'analysis',
    order: 5,
  },

  // ---- STRATEGY LANE — Opus, opportunity invention ----------------------------
  {
    slug: 'opportunity-1',
    name: 'Automation Architect α',
    role: 'Workflow → AI agent design',
    mission: 'Designing the highest-ROI automation for the team',
    lane: 'strategy',
    order: 1,
  },
  {
    slug: 'opportunity-2',
    name: 'Automation Architect β',
    role: 'Customer-facing AI design',
    mission: 'Designing the most visible customer-facing AI win',
    lane: 'strategy',
    order: 2,
  },
  {
    slug: 'opportunity-3',
    name: 'Automation Architect γ',
    role: 'Data leverage design',
    mission: 'Surfacing dormant data into compounding intelligence',
    lane: 'strategy',
    order: 3,
  },
  {
    slug: 'opportunity-4',
    name: 'Automation Architect δ',
    role: 'Ops + back-office design',
    mission: 'Replacing repetitive human ops with reliable agents',
    lane: 'strategy',
    order: 4,
  },
  {
    slug: 'opportunity-5',
    name: 'Automation Architect ε',
    role: 'Growth + revenue design',
    mission: 'Designing an AI-native growth or revenue motion',
    lane: 'strategy',
    order: 5,
  },
  {
    slug: 'roi-quant',
    name: 'ROI Quant',
    role: 'Dollar attribution',
    mission: 'Pricing each opportunity in real annual dollars',
    lane: 'strategy',
    order: 6,
  },

  // ---- OUTPUT LANE — Opus + extended thinking, final synthesis ----------------
  {
    slug: 'thesis-writer',
    name: 'Thesis Writer',
    role: 'Bottom-line argument',
    mission: 'Writing the one-paragraph "why this matters" thesis',
    lane: 'output',
    order: 1,
  },
  {
    slug: 'scope-architect',
    name: 'Scope Architect',
    role: '48-hour build proposal',
    mission: 'Composing the proposed first 48-hour build scope',
    lane: 'output',
    order: 2,
  },
  {
    slug: 'editor-in-chief',
    name: 'Editor-in-Chief',
    role: 'Final pass',
    mission: 'Tightening, naming, and finalizing the dossier',
    lane: 'output',
    order: 3,
  },
]

export function agentBySlug(slug: string): SwarmAgent | undefined {
  return SWARM_AGENTS.find((a) => a.slug === slug)
}
