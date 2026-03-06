/**
 * Canonical NarrativeEvent model - immutable, append-only
 * Aligns with NarrativeEventAppend storage and API contracts.
 */

export interface Provenance {
  operator_id?: string
  ingest_system_id?: string
  write_timestamp: string
  version?: string
  raw_payload_id?: string
}

export interface CanonicalNarrativeEvent {
  event_id: string
  raw_payload_id: string
  source: string
  platform: string
  speaker_entity: string
  speaker_role: string
  audience_class: string
  raw_text: string
  ingestion_timestamp: string
  original_timestamp: string
  metadata: Record<string, unknown>
  authority_score: number | null
  credibility_flags: Record<string, unknown> | null
  provenance: Provenance
  /** Optional: company/ticker from metadata for filtering */
  company_ticker?: string | null
  /** Optional: narrative tag from metadata */
  narrative_tag?: string | null
}

export interface NarrativeEventIngestPayload {
  event_id: string
  raw_payload_id: string
  source: string
  platform: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  ingestion_timestamp: string
  original_timestamp: string
  metadata?: Record<string, unknown>
  authority_score?: number | null
  credibility_flags?: Record<string, unknown> | null
  provenance: Provenance
}

export interface NarrativeEventListParams {
  company?: string
  start?: string
  end?: string
  source?: string
  platform?: string
  audience_class?: string
  limit?: number
  offset?: number
  sort?: 'ingestion_timestamp' | 'original_timestamp' | 'source'
  order?: 'asc' | 'desc'
}

export interface NarrativeEventListResponse {
  items: CanonicalNarrativeEvent[]
  total: number
}

export interface ReplayStatus {
  status: 'idle' | 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
  lastCompletedAt?: string
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}
