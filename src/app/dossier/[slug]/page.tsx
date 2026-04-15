import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDossierBySlug } from '@/lib/dossier/persist'
import { DossierView } from '@/components/dossier/DossierView'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dossier = await getDossierBySlug(slug)
  if (!dossier) {
    return { title: 'Dossier not found' }
  }
  const title = `${dossier.companyName} — Insinuate Dossier`
  const description = dossier.analysis.bottomLineThesis ?? `Personalized AI strategic brief for ${dossier.companyName}.`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/dossier/${slug}` },
  }
}

export default async function DossierPage({ params }: Props) {
  const { slug } = await params
  const dossier = await getDossierBySlug(slug)
  if (!dossier) notFound()
  return <DossierView dossier={dossier} />
}
