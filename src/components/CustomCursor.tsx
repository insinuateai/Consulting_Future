'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)

  const pos = useRef({ x: -100, y: -100 })
  const target = useRef({ x: -100, y: -100 })
  const rafId = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Only activate on pointer-fine (mouse) devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    setVisible(true)

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const interactive = el.closest('a, button, [role="button"], input, textarea, label')
      if (interactive) {
        const isCta = (interactive as HTMLElement).classList.contains('cta-button')
        setCtaHovered(isCta)
        setHovered(true)
      }
    }

    const onOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('a, button, [role="button"], input, textarea, label')) {
        setHovered(false)
        setCtaHovered(false)
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.12)
      pos.current.y = lerp(pos.current.y, target.current.y, 0.12)

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  if (!visible) return null

  const size = ctaHovered ? 52 : hovered ? 38 : 14
  const borderColor = hovered ? '#00F0FF' : 'rgba(240,237,230,0.7)'

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 99999,
        mixBlendMode: 'difference',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.25s',
        willChange: 'transform',
      }}
    >
      {ctaHovered && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: '#fff',
            letterSpacing: '0.05em',
          }}
        >
          →
        </span>
      )}
    </div>
  )
}
