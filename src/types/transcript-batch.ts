/**
 * Transcript batch ingestion types (Resilient Ingestion Pipeline)
 * Aligns with POST /admin/ingest/transcripts/batch and GET /admin/ingest/status/{batch_id}
 */

export type BatchStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial'

export interface TranscriptBatchRequest {
  batch_manifest_url: string
  batch_id: string
  company: string
  ingestion_window?: string
}

export interface BatchManifestItem {
  external_id: string
  url: string
  source?: string
  timestamp?: string
}

export interface BatchStatusResponse {
  batch_id: string
  status: BatchStatus
  company?: string
  total_items: number
  processed: number
  failed: number
  dlq_count: number
  started_at?: string
  completed_at?: string
  error_message?: string
  failed_items?: BatchFailedItem[]
}

export interface BatchFailedItem {
  external_id: string
  error_code: string
  error_message: string
  retry_count: number
}

export interface IngestReplayRequest {
  raw_payload_id: string
  narrative_event_id?: string
  force?: boolean
}

export interface IngestReplayResponse {
  success: boolean
  message?: string
  replay_id?: string
}

/** Storage-layer RawPayload (append-only) for ingestion pipeline */
export interface RawPayloadStorage {
  id: string
  external_id: string
  source: string
  payload: Record<string, unknown>
  ingested_at: string
  batch_id: string | null
  is_processed: boolean
  created_at: string
  updated_at: string
}

/** NarrativeEvent from normalization layer with provenance */
export interface NarrativeEventIngest {
  id: string
  external_id: string
  source: string
  speaker_entity: string
  speaker_role: string
  audience_class: string
  text: string
  timestamp: string
  provenance: {
    raw_payload_id: string
    ingestion_pipeline: string
    transformed_at: string
    version: string
  }
  created_at: string
  updated_at: string
}

/** DeadLetterQueue entry for failed raw payloads */
export interface DeadLetterQueueEntry {
  id: string
  raw_payload_id: string
  source: string
  error_code: string
  error_message: string
  attempted_at: string
  retry_count: number
  batch_id: string | null
  created_at: string
}

/** ReplayQueue entry for manual/automated reprocessing */
export interface ReplayQueueEntry {
  id: string
  raw_payload_id: string
  narrative_event_id: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}
