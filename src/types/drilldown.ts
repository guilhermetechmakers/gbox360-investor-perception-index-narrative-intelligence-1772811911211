/** Drilldown — Why Did This Move? page types */

import type { NarrativeEvent } from './narrative'

export interface Movement {
  movementId: string
  narrativeTitle: string
  currentIPI?: number
  persistenceScore: number
  contributionDelta: number
  events?: NarrativeEvent[] | null
  calculationInputs?: Record<string, unknown> | null
}

export interface DrilldownFilters {
  sourceType?: string
  authorityTier?: string
  credibilityFlags?: string[]
  dateStart?: string
  dateEnd?: string
}

export interface AuditArtifactPayload {
  artifactId: string
  signedAt: string
  signature: string
  payloadReferences: string[]
  narrativeSummary: string
  calculationInputs: Record<string, unknown>
  jsonExport: Record<string, unknown>
  pdfExportUrl?: string
}
