import { useState, useEffect } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms using cubic easeOut.
 * Starts immediately on mount (or when `active` transitions to true).
 * Resets to 0 when `active` is false.
 */
export function useCountUp(target: number, duration: number, active = true): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

    let raf: number
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // cubic easeOut
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, active])

  return value
}
