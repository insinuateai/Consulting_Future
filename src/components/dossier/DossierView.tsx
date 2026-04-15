import Link from 'next/link'
import type { FullDossier } from '@/lib/dossier/types'

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function DossierView({ dossier }: { dossier: FullDossier }) {
  const totalLow = dossier.opportunities.reduce(
    (s, o) => s + o.estSavingsAnnualUSD.low,
    0
  )
  const totalHigh = dossier.opportunities.reduce(
    (s, o) => s + o.estSavingsAnnualUSD.high,
    0
  )
  const totalHours = dossier.opportunities.reduce(
    (s, o) => s + o.estHoursReclaimedWeekly,
    0
  )

  return (
    <div className="min-h-screen bg-deep">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-6 py-6 md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl text-warm transition hover:text-cyan-400"
          >
            Insinuate
          </Link>
          <Link
            href="https://calendly.com/kianjquinlan/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-cyan-400 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300"
          >
            Book the build →
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
        {/* Title block */}
        <div className="mb-16">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
            DOSSIER · {new Date(dossier.generatedAt).toLocaleDateString()} ·{' '}
            {dossier.domain}
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-warm md:text-7xl">
            {dossier.companyName}
          </h1>
          <p className="mt-6 text-2xl leading-relaxed text-warm/85 font-serif">
            {dossier.analysis.bottomLineThesis}
          </p>
        </div>

        {/* Quick stats */}
        <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat
            label="Annual savings range"
            value={`${fmt.format(totalLow)} – ${fmt.format(totalHigh)}`}
          />
          <Stat
            label="Hours reclaimed / week"
            value={`${totalHours}+ hrs`}
          />
          <Stat label="Opportunities identified" value={`${dossier.opportunities.length}`} />
        </div>

        {/* Snapshot */}
        <Section label="01 · Snapshot" title="Where you are today">
          <Field label="Industry" value={dossier.analysis.industry} />
          <Field label="Positioning" value={dossier.analysis.positioning} />
          <Field
            label="Audience"
            value={dossier.analysis.audienceSummary}
          />
          <Field
            label="Tech stack"
            value={dossier.analysis.techStackSummary}
          />
          <Field
            label="Competitive context"
            value={dossier.analysis.competitiveContext}
          />
        </Section>

        {/* Pain points */}
        <Section label="02 · Pain points" title="Where the bleeding is">
          <ul className="space-y-3">
            {dossier.analysis.topPainPoints.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-[12px] text-cyan-400/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-warm/85">{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Opportunities */}
        <Section
          label="03 · Opportunities"
          title="Where to spend the next 48 hours"
        >
          <div className="space-y-6">
            {dossier.opportunities.map((opp, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-6"
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-400">
                    Opportunity {String(i + 1).padStart(2, '0')} · {opp.confidence.toUpperCase()} CONFIDENCE
                  </div>
                  <div className="font-mono text-[11px] text-green-400">
                    {fmt.format(opp.estSavingsAnnualUSD.low)} – {fmt.format(opp.estSavingsAnnualUSD.high)} / yr
                  </div>
                </div>
                <h3 className="font-serif text-2xl text-warm">{opp.title}</h3>
                <p className="mt-2 text-warm/70">{opp.description}</p>
                {opp.build48HrScope && (
                  <p className="mt-3 text-sm text-warm/55">
                    <span className="font-mono uppercase tracking-wider text-warm/40">
                      48-hr scope ·{' '}
                    </span>
                    {opp.build48HrScope}
                  </p>
                )}
                {opp.techRequired.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {opp.techRequired.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-white/[0.08] bg-black/30 px-2 py-1 font-mono text-[10px] text-warm/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 font-mono text-[10px] text-warm/40">
                  ~{opp.estHoursReclaimedWeekly} hrs/week reclaimed
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Proposed scope */}
        <Section
          label="04 · Proposed first build"
          title={dossier.proposedScope.title}
        >
          <p className="text-warm/85">{dossier.proposedScope.summary}</p>
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm/50">
              Deliverables
            </div>
            <ul className="mt-3 space-y-2">
              {dossier.proposedScope.deliverables.map((d, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-cyan-400">→</span>
                  <span className="text-warm/85">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Timeline" value={dossier.proposedScope.timeline} />
            <Field
              label="Investment"
              value={`${fmt.format(dossier.proposedScope.investmentRangeUSD.low)} – ${fmt.format(dossier.proposedScope.investmentRangeUSD.high)}`}
            />
          </div>
        </Section>

        {/* CTA */}
        <div className="mt-20 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.03] p-10 text-center">
          <h2 className="font-serif text-3xl text-warm">
            Ready to ship the first opportunity in 48 hours?
          </h2>
          <p className="mt-3 text-warm/65">
            Book a 30-minute call. We&apos;ll align on scope, sign a one-page SOW, and start building tomorrow.
          </p>
          <Link
            href="https://calendly.com/kianjquinlan/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded bg-cyan-400 px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300"
          >
            Book the build →
          </Link>
        </div>
      </article>
    </div>
  )
}

function Section({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-16 border-t border-white/[0.05] pt-12">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
        {label}
      </div>
      <h2 className="mt-3 font-serif text-3xl text-warm">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm/45">
        {label}
      </div>
      <div className="mt-1 text-warm/85">{value}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-warm/45">
        {label}
      </div>
      <div className="mt-2 font-serif text-2xl text-warm">{value}</div>
    </div>
  )
}
