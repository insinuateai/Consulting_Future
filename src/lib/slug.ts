/**
 * URL-safe random slug. Crockford-style alphabet (no easily-confused chars).
 * 10 chars = ~52 bits of entropy — plenty for sharable dossier URLs.
 */
const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'

export function shortSlug(length = 10): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return out
}

/** Slugify a domain into a more memorable prefix, then append entropy. */
export function dossierSlug(domain: string): string {
  const base = domain
    .replace(/^www\./, '')
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 14)
  return `${base || 'co'}-${shortSlug(6)}`
}
