// Converts an enhanced Synopsis into a rich prompt for the build-app pipeline.
// This is the bridge between the chatbot conversation output and the prototype generator.

import type { Synopsis } from './types'

export function buildAppPrompt(synopsis: Synopsis): string {
  const { appSpec, businessType, vision, agenticWorkflow } = synopsis

  const pagesList = appSpec.pages
    .map((p) => `- ${p.name}: ${p.description}`)
    .join('\n')

  const dataList = appSpec.dataModel.map((d) => `- ${d}`).join('\n')

  const featuresList = appSpec.keyFeatures.map((f) => `- ${f}`).join('\n')

  return `Build a production-quality single-page web application called "${appSpec.name}".

Tagline: ${appSpec.tagline}
Industry: ${businessType}

This app should have the following sections/views (use tab navigation or anchor sections):

${pagesList}

Data Model (seed with 3-5 realistic sample rows per entity):

${dataList}

Key Features:

${featuresList}

Visual Design:
${appSpec.aesthetic}
Use a dark, cinematic aesthetic as the base — near-black background (#030303), with accent colors appropriate for the ${businessType} industry. Make it feel like a premium SaaS product. Include smooth transitions and hover effects.

Context — this prototype is for a business whose vision is:
"${vision}"

Their workflow currently involves:
"${agenticWorkflow}"

Build something that would make this founder say "holy shit, this is exactly what I need" within 5 seconds of seeing it. Seed it with realistic data that matches their industry. Every interaction should work.`
}
