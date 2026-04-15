import { NextRequest } from 'next/server'
import { getGeneratedApp } from '@/lib/buildapp/persist'

export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * Renders a generated app's index.html directly. Other files (main.js, etc.)
 * are inlined into the HTML via <script> tags when served here — keeps this
 * route stateless and avoids a second roundtrip.
 *
 * Served with strict CSP + sandbox framing so it can only run in our own
 * iframe preview.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const app = await getGeneratedApp(id)
  if (!app || !app.files.length) {
    return new Response('<h1>App not found</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const index = app.files.find((f) => /index\.html?$/i.test(f.path)) ?? app.files[0]
  let html = index.content

  // Inline co-located JS/CSS files so preview works without filesystem.
  for (const f of app.files) {
    if (f === index) continue
    if (f.language === 'js') {
      html = html.replace(
        new RegExp(`<script[^>]*src=["'][^"']*${escapeRe(f.path)}["'][^>]*></script>`, 'g'),
        `<script type="module">${f.content}</script>`
      )
    }
    if (f.language === 'css') {
      html = html.replace(
        new RegExp(`<link[^>]*href=["'][^"']*${escapeRe(f.path)}["'][^>]*>`, 'g'),
        `<style>${f.content}</style>`
      )
    }
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; frame-ancestors 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
