/**
 * Canonical NarrativeEvent types for append-only event store.
 * Aligns with narrative_event_append table schema.
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
}

export interface CanonicalNarrativeEventInsert {
  event_id?: string
  raw_payload_id: string
  source: string
  platform?: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  ingestion_timestamp?: string
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
  sort?: string
  order?: 'asc' | 'desc'
}

export interface NarrativeEventListResponse {
  items: CanonicalNarrativeEvent[]
  total: number
}

export type ReplayStatus = 'idle' | 'running' | 'completed' | 'failed'

export interface ReplayStatusResponse {
  status: ReplayStatus
  started_at?: string
  completed_at?: string
  last_event_id?: string
  last_timestamp?: string
  error_message?: string
}
