'use client'

import { useMemo } from 'react'
import { BuildConsole } from '@/components/buildapp/BuildConsole'
import { buildAppPrompt } from '@/lib/intake/prompt-builder'
import type { Synopsis } from '@/lib/intake/types'

type Props = {
  synopsis: Synopsis
  email?: string
  onBack: () => void
}

export default function PrototypeBuilder({ synopsis, email, onBack }: Props) {
  const prompt = useMemo(() => buildAppPrompt(synopsis), [synopsis])

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BuildConsole prompt={prompt} email={email} onReset={onBack} />
    </div>
  )
}
