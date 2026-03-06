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
}
