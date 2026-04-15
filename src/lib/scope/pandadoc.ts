import { serverEnv } from '../env'
import type { ScopeLine } from './catalog'
import { priceScope } from './catalog'

/**
 * Create a SOW document via PandaDoc from a scope. Returns a signing URL.
 * Falls back to null if PANDADOC_API_KEY not set — caller emails the SOW
 * as plain text instead.
 */
export async function createSowDocument(args: {
  email: string
  companyName: string
  lines: ScopeLine[]
}): Promise<{ id: string; viewUrl: string } | null> {
  const key = serverEnv.PANDADOC_API_KEY
  if (!key) return null

  const { items, totalCents, timelineDays } = priceScope(args.lines)
  const body = {
    name: `Insinuate SOW — ${args.companyName}`,
    template_uuid: undefined,
    recipients: [{ email: args.email, role: 'client' }],
    tokens: [
      { name: 'company_name', value: args.companyName },
      { name: 'total', value: `$${(totalCents / 100).toLocaleString()}` },
      { name: 'timeline_days', value: String(timelineDays) },
      {
        name: 'line_items',
        value: items.map((i) => `${i.line.label} × ${i.qty}`).join('\n'),
      },
    ],
  }

  const res = await fetch('https://api.pandadoc.com/public/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `API-Key ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { id?: string }
  if (!json.id) return null
  return {
    id: json.id,
    viewUrl: `https://app.pandadoc.com/a/#/documents/${json.id}`,
  }
}
