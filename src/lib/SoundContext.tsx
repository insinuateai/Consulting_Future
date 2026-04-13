'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

export type SoundEffect =
  | 'hover'
  | 'click'
  | 'xray-scan'
  | 'xray-complete'
  | 'ticker-blip'
  | 'counter-tick'

interface SoundContextType {
  enabled: boolean
  toggle: () => void
  playEffect: (name: SoundEffect) => void
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  toggle: () => {},
  playEffect: () => {},
})

export function useSoundContext() {
  return useContext(SoundContext)
}

interface AmbientNodes {
  masterGain: GainNode
  stoppables: AudioScheduledSourceNode[]
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const ambientRef = useRef<AmbientNodes | null>(null)
  const fadeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rehydrate preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('insinuate-sound')
    if (saved === 'true') setEnabled(true)
  }, [])

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const startAmbient = useCallback(() => {
    if (ambientRef.current) return
    try {
      const ctx = getCtx()
      const stoppables: AudioScheduledSourceNode[] = []

      // Master gain — fade in over 3s
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 3)
      masterGain.connect(ctx.destination)

      // Osc 1: 55 Hz (A1)
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.value = 55
      const g1 = ctx.createGain()
      g1.gain.value = 0.015
      osc1.connect(g1)
      g1.connect(masterGain)
      osc1.start()
      stoppables.push(osc1)

      // Osc 2: 82.5 Hz (E2 — perfect fifth)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = 82.5
      const g2 = ctx.createGain()
      g2.gain.value = 0.015
      osc2.connect(g2)
      g2.connect(masterGain)
      osc2.start()
      stoppables.push(osc2)

      // LFO at 0.1 Hz — slow "breathing" modulation on osc gains
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.1
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.004
      lfo.connect(lfoGain)
      lfoGain.connect(g1.gain)
      lfoGain.connect(g2.gain)
      lfo.start()
      stoppables.push(lfo)

      // White noise through lowpass at 200 Hz
      const bufSize = Math.floor(ctx.sampleRate * 2)
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = buf
      noise.loop = true
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.005
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 200
      noise.connect(lp)
      lp.connect(noiseGain)
      noiseGain.connect(masterGain)
      noise.start()
      stoppables.push(noise)

      ambientRef.current = { masterGain, stoppables }
    } catch {
      // Web Audio API unavailable
    }
  }, [getCtx])

  const stopAmbient = useCallback(() => {
    const ambient = ambientRef.current
    const ctx = ctxRef.current
    if (!ambient || !ctx) return

    ambient.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)

    if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current)
    fadeOutTimer.current = setTimeout(() => {
      ambient.stoppables.forEach(n => {
        try { n.stop() } catch { /* already stopped */ }
      })
      ambientRef.current = null
    }, 2200)
  }, [])

  useEffect(() => {
    if (enabled) {
      startAmbient()
    } else {
      stopAmbient()
    }
  }, [enabled, startAmbient, stopAmbient])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current)
      ambientRef.current?.stoppables.forEach(n => {
        try { n.stop() } catch { /* noop */ }
      })
      ctxRef.current?.close()
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem('insinuate-sound', String(next))
      return next
    })
  }, [])

  const playEffect = useCallback(
    (name: SoundEffect) => {
      if (!enabled) return
      try {
        const ctx = getCtx()
        const t = ctx.currentTime

        switch (name) {
          case 'hover': {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.frequency.value = 2000
            g.gain.setValueAtTime(0.02, t)
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
            osc.connect(g)
            g.connect(ctx.destination)
            osc.start(t)
            osc.stop(t + 0.06)
            break
          }
          case 'click': {
            const len = Math.floor(ctx.sampleRate * 0.08)
            const buf = ctx.createBuffer(1, len, ctx.sampleRate)
            const d = buf.getChannelData(0)
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
            const src = ctx.createBufferSource()
            src.buffer = buf
            const g = ctx.createGain()
            const f = ctx.createBiquadFilter()
            f.type = 'highpass'
            f.frequency.value = 4000
            g.gain.setValueAtTime(0.03, t)
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
            src.connect(f)
            f.connect(g)
            g.connect(ctx.destination)
            src.start()
            break
          }
          case 'xray-scan': {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.frequency.setValueAtTime(200, t)
            osc.frequency.exponentialRampToValueAtTime(2000, t + 0.3)
            g.gain.setValueAtTime(0.03, t)
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
            osc.connect(g)
            g.connect(ctx.destination)
            osc.start(t)
            osc.stop(t + 0.32)
            break
          }
          case 'xray-complete': {
            const o1 = ctx.createOscillator()
            const g1 = ctx.createGain()
            o1.frequency.value = 800
            g1.gain.setValueAtTime(0.04, t)
            g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
            o1.connect(g1)
            g1.connect(ctx.destination)
            o1.start(t)
            o1.stop(t + 0.12)

            const o2 = ctx.createOscillator()
            const g2 = ctx.createGain()
            o2.frequency.value = 1200
            g2.gain.setValueAtTime(0.04, t + 0.1)
            g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
            o2.connect(g2)
            g2.connect(ctx.destination)
            o2.start(t + 0.1)
            o2.stop(t + 0.28)
            break
          }
          case 'ticker-blip': {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.frequency.value = 1500
            g.gain.setValueAtTime(0.01, t)
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
            osc.connect(g)
            g.connect(ctx.destination)
            osc.start(t)
            osc.stop(t + 0.025)
            break
          }
          case 'counter-tick': {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.frequency.value = 1200
            g.gain.setValueAtTime(0.008, t)
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.015)
            osc.connect(g)
            g.connect(ctx.destination)
            osc.start(t)
            osc.stop(t + 0.02)
            break
          }
        }
      } catch {
        // Audio playback error — fail silently
      }
    },
    [enabled, getCtx],
  )

  return (
    <SoundContext.Provider value={{ enabled, toggle, playEffect }}>
      {children}
    </SoundContext.Provider>
  )
}
