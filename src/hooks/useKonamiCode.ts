import { useEffect, useRef } from 'react'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export function useKonamiCode(onActivate: () => void) {
  const posRef = useRef(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === SEQUENCE[posRef.current]) {
        posRef.current += 1
        if (posRef.current === SEQUENCE.length) {
          posRef.current = 0
          onActivate()
        }
      } else {
        // Partial reset — check if the new key starts a new sequence
        posRef.current = e.key === SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onActivate])
}
