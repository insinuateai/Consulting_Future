// AI Board Room — 4 executive Claude personas debate a dossier in real time.

export type ExecRole = 'cfo' | 'cmo' | 'cto' | 'coo'

export interface BoardRoomInput {
  /** Optional dossier slug — if present, debate is seeded from its findings. */
  dossierSlug?: string
  /** Topic / question the board will debate. */
  topic: string
  /** Optional free-form context (founder's note, constraints, etc.). */
  context?: string
}

export interface ExecPersona {
  role: ExecRole
  name: string
  title: string
  tagline: string
  systemPrompt: string
}

export interface Vote {
  role: ExecRole
  recommendation: string
  confidence: 'low' | 'medium' | 'high'
  rationale: string
}

export type BoardRoomEvent =
  | { type: 'started'; topic: string }
  | { type: 'exec.thinking'; role: ExecRole }
  | { type: 'exec.chunk'; role: ExecRole; chunk: string }
  | { type: 'exec.done'; role: ExecRole; text: string }
  | { type: 'exec.error'; role: ExecRole; error: string }
  | { type: 'phase'; phase: 'opening' | 'debate' | 'vote' }
  | { type: 'vote'; votes: Vote[]; winner: string }
  | { type: 'complete' }
  | { type: 'error'; error: string }
