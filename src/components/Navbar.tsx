'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSoundContext } from '@/lib/SoundContext'
import { BookingModal } from './BookingModal'

const NAV_LINKS = [
  { label: 'X-Ray',     href: '/#xray' },
  { label: 'Manifesto', href: '/manifesto' },
  { label: 'Intake',    href: '/intake' },
] as const

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { playEffect } = useSoundContext()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Main navigation"
      style={{
        animation: 'navReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      className={[
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'px-6 md:px-12 py-4',
        'transition-all duration-500',
        scrolled
          ? 'bg-deep/80 backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent',
      ].join(' ')}
    >
      {/* Logo */}
      <Link
        href="/"
        onMouseEnter={() => playEffect('hover')}
        className="font-display text-xl text-warm tracking-tight hover:text-cyan transition-colors duration-300"
        aria-label="Insinuate — home"
      >
        Insinuate
      </Link>

      {/* Center nav links */}
      <ul
        className="hidden md:flex items-center gap-8"
        role="list"
      >
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              onMouseEnter={() => playEffect('hover')}
              className={[
                'font-mono uppercase tracking-widest text-xs',
                'text-muted hover:text-warm',
                'transition-colors duration-300',
                'relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px',
                'after:bg-cyan after:transition-all after:duration-300',
                'hover:after:w-full',
              ].join(' ')}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onMouseEnter={() => playEffect('hover')}
        onClick={() => {
          playEffect('click')
          setBookingOpen(true)
        }}
        aria-label="Book a call with Insinuate"
        className={[
          'cta-button font-mono uppercase tracking-widest text-xs',
          'px-4 py-2 rounded',
          'border border-cyan text-cyan',
          'hover:bg-cyan hover:text-deep',
          'transition-all duration-300',
          'cursor-pointer',
        ].join(' ')}
      >
        Book a Call
      </button>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </nav>
  )
}
