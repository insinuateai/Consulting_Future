import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env'

const STATIC_ROUTES = [
  '',
  '/manifesto',
  '/playground',
  '/boardroom',
  '/build',
  '/intake',
  '/hire',
  '/scope',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  const now = new Date()
  return STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
