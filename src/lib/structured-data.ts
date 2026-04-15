import { clientEnv } from './env'

const BASE = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')

export const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Insinuate',
  legalName: 'Insinuate.ai',
  url: BASE,
  logo: `${BASE}/logo.png`,
  description:
    "We don't consult. We build. Production AI systems shipped in 48 hours.",
  email: 'hello@insinuate.ai',
  founders: [
    { '@type': 'Person', name: 'Kian Quinlan' },
    { '@type': 'Person', name: 'Charlie' },
  ],
  sameAs: ['https://calendly.com/kianjquinlan/30min'],
}

export const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI Consulting & Implementation',
  provider: { '@type': 'Organization', name: 'Insinuate' },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Insinuate Engagement Tiers',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Business X-Ray',
        description:
          'Free 60-second AI audit of your business with a personalized strategic dossier.',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: '48-Hour Proof of Concept',
        description:
          'Production-ready AI prototype shipped in 48 hours.',
      },
      {
        '@type': 'Offer',
        name: '1-Week AI Residency',
        description:
          'Embedded build week — full workflow automation in 5 days.',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 25000,
          maxPrice: 75000,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Offer',
        name: 'Ongoing Scale',
        description: 'Continuous AI build partnership.',
      },
    ],
  },
}

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can you ship production AI in 48 hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We pre-build a library of production-grade AI primitives — RAG pipelines, agent orchestration, evaluation harnesses, deploy infra — then compose them around your specific workflow. The 48 hours is integration, not invention.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does it cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The X-Ray and Dossier are free. A 1-Week AI Residency typically ranges from $25K to $75K depending on scope. Self-serve scopes under $50K can be booked instantly via our online scope builder.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from a typical consultancy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We ship code, not decks. Every engagement ends with a deployed system in production — usually within a week. No PowerPoints, no roadmap-only deliverables, no months of discovery.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I try your AI agents before hiring you?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our /playground page lets you run real Claude-powered agents on your own data — invoice extraction, lead scoring, support drafting — in seconds, no signup needed.',
      },
    },
  ],
}

export function jsonLd(schema: unknown) {
  return {
    __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
  }
}
