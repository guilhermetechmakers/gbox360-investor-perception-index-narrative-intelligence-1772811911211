/** Company View (IPI Detail) page types */

import type { NarrativeEvent } from './narrative'

export interface NarrativeContribution {
  narrativeId: string
  name: string
  summary?: string
  contribution: number
  authority?: string
}

export interface IPIBreakdownWeights {
  narrative: number
  credibility: number
  risk: number
}

export interface IPIViewContext {
  companyId: string
  companyName?: string
  windowStart: string
  windowEnd: string
  ipi?: number
  delta?: number
  direction?: 'up' | 'down' | 'flat'
  breakdown?: IPIBreakdownWeights
  narratives?: NarrativeContribution[]
  events?: NarrativeEvent[]
  timestamp?: string
}

export interface AuditArtifactPayload {
  id: string
  format: 'JSON' | 'PDF'
  createdAt: string
  signed: boolean
  payloadReferences: string[]
  calculationInputs: {
    narrativeWeight: number
    credibilityWeight: number
    riskWeight: number
  }
  companyId: string
  windowStart: string
  windowEnd: string
  ipi?: number
  breakdown?: IPIBreakdownWeights
  narratives?: Array<{ id: string; name: string; contribution: number }>
  events?: Array<{ event_id: string; raw_payload_id: string }>
}

export interface PeerSnapshot {
  id: string
  name: string
  ticker?: string
  score?: number
  delta?: number
}
