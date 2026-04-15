'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { clientEnv } from './env'

let initialized = false

function init() {
  if (initialized) return
  if (typeof window === 'undefined') return
  const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    autocapture: true,
  })
  initialized = true
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    init()
  }, [])
  return <>{children}</>
}

export { posthog }
