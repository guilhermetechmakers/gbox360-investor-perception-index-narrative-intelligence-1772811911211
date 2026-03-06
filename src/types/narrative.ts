export interface NarrativeEvent {
  event_id: string
  raw_payload_id: string
  source: string
  platform?: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  ingestion_timestamp: string
  original_timestamp: string
  metadata?: Record<string, unknown>
  authority_score?: number
  credibility_flags?: string[]
  company_id?: string
  narrative_id?: string
}

export interface Narrative {
  id: string
  label: string
  persistence: number
  contribution: number
  event_count: number
  company_id: string
  window_start: string
  window_end: string
}

/** Narrative contribution for IPI calculation display */
export interface NarrativeContribution {
  narrativeId: string
  label: string
  contribution: number
  sourceRefs: string[]
}

/** Audit provenance for IPI calculation traceability */
export interface AuditProvenance {
  provenanceId: string
  companyId: string
  windowStart: string
  windowEnd: string
  inputVector: {
    narrativeMetrics: Record<string, unknown>
    credibilityProxies: Record<string, unknown>
    riskFlags: Record<string, unknown>
  }
  weightsUsed: { narrative: number; credibility: number; risk: number }
  computedIPI: number
  timestamp: string
}

export interface IPIBreakdown {
  narrative: number
  credibility: number
  risk: number
}

export interface IPISnapshot {
  company_id: string
  company_name: string
  score: number
  direction: 'up' | 'down' | 'flat'
  percent_change: number
  breakdown: IPIBreakdown
  top_narratives: Narrative[]
  window_start: string
  window_end: string
  weight_version: string
  /** Provenance ID for audit drill-down */
  provenance_id?: string
  /** Timestamp of calculation */
  timestamp?: string
}

/** IPI calculate request */
export interface IPICalculateRequest {
  companyId: string
  windowStart: string
  windowEnd: string
  topN?: number
}

/** IPI calculate response */
export interface IPICalculateResponse {
  currentIPI: number
  direction: 'UP' | 'DOWN' | 'FLAT'
  topNarratives: NarrativeContribution[]
  timestamp: string
  provenanceId: string
}
