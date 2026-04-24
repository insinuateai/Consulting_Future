import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google'

/**
 * Display / editorial headings — Instrument Serif
 * Applies as CSS variable --font-display
 */
export const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

/**
 * Body / UI text — Geist Sans (falls back to DM Sans if unavailable)
 * Applies as CSS variable --font-sans
 */
export const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

/**
 * Data / labels / code — Geist Mono (falls back to Fira Code)
 * Applies as CSS variable --font-mono
 */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
