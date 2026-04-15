// Intake flow types — chatbot discovery → synopsis → prototype builder

export type InsightCategory =
  | 'pain_point'
  | 'goal'
  | 'tool'
  | 'audience'
  | 'industry'
  | 'workflow'

export type Insight = {
  text: string
  category: InsightCategory
  confidence: number // 0-1
  sourceIndex: number // which message it came from
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type Act = 1 | 2 | 3 | 4

export interface AppSpecPage {
  name: string
  description: string
}

export interface AppSpec {
  name: string
  tagline: string
  pages: AppSpecPage[]
  dataModel: string[]
  keyFeatures: string[]
  aesthetic: string
}

export interface Synopsis {
  vision: string
  agenticWorkflow: string
  mvpRoadmap: string[]
  businessType: string
  appSpec: AppSpec
}

export interface IntakeSession {
  id: string
  messages: Message[]
  insights: Insight[]
  synopsis: Synopsis | null
  appId: string | null
  status: 'discovery' | 'synopsis' | 'building' | 'complete'
}
