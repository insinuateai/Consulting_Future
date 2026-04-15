import { sendEmail } from '../resend'
import { clientEnv } from '../env'
import { DossierReadyEmail } from '../../emails/DossierReady'
import type { FullDossier } from './types'

export async function emailDossierReady(
  to: string,
  dossier: FullDossier
): Promise<void> {
  const url = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/dossier/${dossier.slug}`
  const top = dossier.opportunities[0]
  try {
    await sendEmail({
      to,
      subject: `Your Insinuate dossier for ${dossier.companyName} is ready`,
      react: DossierReadyEmail({
        companyName: dossier.companyName,
        thesis: dossier.analysis.bottomLineThesis,
        dossierUrl: url,
        topOpportunity: top
          ? `${top.title}: ${top.description}`
          : 'A focused 48-hour build to ship one production AI win.',
      }),
    })
  } catch (err) {
    console.error('emailDossierReady failed', err)
  }
}
