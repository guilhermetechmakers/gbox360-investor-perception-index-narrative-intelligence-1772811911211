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

export type SortByField = 'timestamp' | 'source' | 'authority'
export type SortOrder = 'asc' | 'desc'

export interface DrilldownFilters {
  sourceType?: string
  authorityTier?: string
  credibilityFlags?: string[]
  dateStart?: string
  dateEnd?: string
  sortBy?: SortByField
  sortOrder?: SortOrder
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

/** Response shape for POST /api/export/audit */
export interface ArtifactMeta {
  id: string
  companyId: string
  narrativeId?: string
  timeWindow: { start: string; end: string }
  format: 'json' | 'pdf'
  generatedAt: string
  sha256: string
}

export interface ExportAuditResponse {
  url: string
  artifactMeta: ArtifactMeta
}
