/**
 * Fetch a URL with a desktop UA + 8s timeout. Returns truncated HTML
 * (50KB max) plus extracted plain-text excerpts the agents can reason about.
 *
 * This intentionally extends the existing /api/xray fetcher rather than
 * replacing it — the dossier needs richer text extraction.
 */

const MAX_HTML_BYTES = 50_000
const FETCH_TIMEOUT_MS = 8_000
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export interface FetchedPage {
  url: string
  domain: string
  html: string
  textExcerpt: string
  title: string | null
  description: string | null
  ok: boolean
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  let domain = ''
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return blank(url, '')
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    })
    clearTimeout(timer)
    if (!res.ok) return blank(url, domain)
    const buffer = await res.arrayBuffer()
    const sliced = buffer.slice(0, MAX_HTML_BYTES)
    const html = new TextDecoder('utf-8', { fatal: false }).decode(sliced)
    return {
      url,
      domain,
      html,
      textExcerpt: extractText(html),
      title: extractTag(html, 'title'),
      description: extractMeta(html, 'description'),
      ok: true,
    }
  } catch {
    clearTimeout(timer)
    return blank(url, domain)
  }
}

function blank(url: string, domain: string): FetchedPage {
  return {
    url,
    domain,
    html: '',
    textExcerpt: '',
    title: null,
    description: null,
    ok: false,
  }
}

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8_000)
}

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = html.match(re)
  return m ? m[1].trim().slice(0, 200) : null
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`,
    'i'
  )
  const m = html.match(re)
  return m ? m[1].trim().slice(0, 300) : null
}
