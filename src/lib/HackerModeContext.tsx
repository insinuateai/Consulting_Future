'use client'

import { createContext, useContext, useState } from 'react'

interface HackerModeContextType {
  active: boolean
  setActive: (v: boolean) => void
}

const HackerModeContext = createContext<HackerModeContextType>({
  active: false,
  setActive: () => {},
})

export function useHackerMode() {
  return useContext(HackerModeContext)
}

export function HackerModeProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)

  return (
    <HackerModeContext.Provider value={{ active, setActive }}>
      {children}
    </HackerModeContext.Provider>
  )
}
