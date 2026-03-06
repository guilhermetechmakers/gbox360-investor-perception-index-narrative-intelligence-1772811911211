/**
 * Credibility Proxy & Risk Signals types
 * Per-narrative and per-event scoring with traceable lineage.
 */

export type SignalType =
  | 'management_language_consistency'
  | 'repetition_consistency'
  | 'negative_earnings_language'
  | 'legal_governance_words'

export interface SignalRecord {
  id: string
  narrative_id?: string
  type: SignalType | string
  description: string
  weight: number
  source: string
  detected_at: string
}

export interface NarrativeEventWithSignals {
  id?: string
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
  authority_score?: number | null
  credibility_flags?: string[] | Record<string, unknown> | null
  /** Credibility score 0–1 */
  credibility_score?: number | null
  /** Risk score 0–1 */
  risk_score?: number | null
  /** Embedded signals for provenance */
  signals?: SignalRecord[]
  provenance?: Record<string, unknown>
  company_id?: string
  narrative_id?: string
}

export interface NarrativeIngestPayload {
  source_platform?: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  raw_text: string
  event_time: string
  provenance?: Record<string, unknown>
  [key: string]: unknown
}

export interface NarrativeIngestResponse {
  narrative_id: string
  credibility_score: number
  risk_score: number
  signals: SignalRecord[]
}

export interface NarrativeWithSignalsResponse {
  items: NarrativeEventWithSignals[]
  total: number
}

export interface RecomputeSignalsRequest {
  narrative_ids?: string[]
  window?: string
  company_id?: string
  start?: string
  end?: string
}

export interface RecomputeSignalsResponse {
  updated_count: number
}
