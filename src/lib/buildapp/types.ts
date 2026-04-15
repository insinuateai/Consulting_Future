// Sprint 3 — "Build Me One Right Now" live app generator.
// Claude writes a small single-page web app in ~60-120s, streams each file
// as it's written, and either inline-previews it or deploys to Vercel.

export interface BuildAppInput {
  prompt: string
  email?: string
}

export interface GeneratedFile {
  path: string
  content: string
  language: 'html' | 'js' | 'ts' | 'css' | 'md' | 'json'
}

export interface BuildPlan {
  appName: string
  summary: string
  files: string[]
  stack: string[]
}

export interface DeployResult {
  url: string
  previewUrl?: string
  repoUrl?: string
  inline?: boolean
}

export type BuildAppEvent =
  | { type: 'started'; prompt: string; appId: string }
  | { type: 'plan'; plan: BuildPlan }
  | { type: 'file.started'; path: string }
  | { type: 'file.chunk'; path: string; chunk: string }
  | { type: 'file.done'; file: GeneratedFile }
  | { type: 'deploy.started' }
  | { type: 'deploy.ready'; result: DeployResult }
  | { type: 'complete'; appId: string; files: GeneratedFile[]; deploy: DeployResult }
  | { type: 'error'; error: string }
