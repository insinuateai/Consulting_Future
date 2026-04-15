import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
