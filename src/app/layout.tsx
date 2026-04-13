import type { Metadata } from 'next'
import { instrumentSerif, geistSans, geistMono } from '@/lib/fonts'
import { SmoothScroll } from '@/components/SmoothScroll'
import './globals.css'

export const metadata: Metadata = {
  title: 'Insinuate — AI Strategy & Execution',
  description:
    "We don't consult. We build. 48 hours from problem to production.",
  openGraph: {
    title: 'Insinuate — AI Strategy & Execution',
    description:
      "We don't consult. We build. 48 hours from problem to production.",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={[
        instrumentSerif.variable,
        geistSans.variable,
        geistMono.variable,
      ].join(' ')}
    >
      <body className="font-sans bg-deep text-warm antialiased overflow-x-hidden">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
