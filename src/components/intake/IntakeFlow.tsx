'use client'

import { useState } from 'react'
import IntakeChat from './IntakeChat'
import IntakeSidebar from './IntakeSidebar'
import GamePlanPanel from './GamePlanPanel'
import PrototypeBuilder from './PrototypeBuilder'
import ConversionPanel from './ConversionPanel'
import type { Act, Insight, Message, Synopsis } from '@/lib/intake/types'

type Stage = 'chat' | 'plan' | 'build' | 'convert'

export default function IntakeFlow() {
  const [stage, setStage] = useState<Stage>('chat')
  const [act, setAct] = useState<Act>(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [, setInsights] = useState<Insight[]>([])
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [synopsis, setSynopsis] = useState<Synopsis | null>(null)

  const handleSynopsis = (s: Synopsis) => {
    setSynopsis(s)
    setStage('plan')
  }

  if (stage === 'plan' && synopsis) {
    return (
      <section className="bg-[var(--black-deep)]">
        <GamePlanPanel
          synopsis={synopsis}
          onBuild={() => setStage('build')}
          onBack={() => setStage('chat')}
        />
      </section>
    )
  }

  if (stage === 'build' && synopsis) {
    return (
      <section className="bg-[var(--black-deep)]">
        <PrototypeBuilder synopsis={synopsis} onBack={() => setStage('plan')} />
        <ConversionPanel synopsis={synopsis} />
      </section>
    )
  }

  if (stage === 'convert') {
    return (
      <section className="bg-[var(--black-deep)]">
        <ConversionPanel synopsis={synopsis} />
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[var(--black-deep)] grid grid-cols-1 lg:grid-cols-[380px_1fr]">
      <IntakeSidebar
        messages={messages}
        act={act}
        questionsAnswered={questionsAnswered}
      />
      <div className="min-h-screen">
        <IntakeChat
          onActChange={setAct}
          onSynopsis={handleSynopsis}
          onMessagesChange={setMessages}
          onInsightsChange={setInsights}
          onQuestionsAnsweredChange={setQuestionsAnswered}
        />
      </div>
    </section>
  )
}
