export type TwinNodeKind =
  | 'system'
  | 'data'
  | 'human'
  | 'agent'
  | 'integration'

export interface TwinNode {
  id: string
  label: string
  kind: TwinNodeKind
  /** Logical column in the machine diagram — 0..3. */
  column: number
  /** Status in the *current* state. */
  currentState: 'bottleneck' | 'manual' | 'healthy' | 'missing'
  /** Status in the *future* AI-enhanced state. */
  futureState: 'automated' | 'augmented' | 'healthy' | 'retired'
  /** Short note rendered on hover. */
  note?: string
}

export interface TwinEdge {
  from: string
  to: string
  /** Thickness proxy — 1..5, scales flow volume in the viz. */
  weight: number
  /** Is this edge slow in current state? (renders red). */
  slow: boolean
}

export interface TwinRoiPoint {
  label: string
  currentUsd: number
  futureUsd: number
}

export interface DigitalTwin {
  companyName: string
  domain: string
  currentStateSummary: string
  futureStateSummary: string
  nodes: TwinNode[]
  edges: TwinEdge[]
  roi: TwinRoiPoint[]
}
