/**
 * Topic Classification & Narrative Persistence types
 * Aligns with Topic Classification spec and runtime safety rules.
 */

export interface TopicLabel {
  topic: string
  confidence: number
}

export interface TopicClassificationResult {
  top_topic_labels: TopicLabel[]
  primary_topic: string
  clustering_id: string | null
  explanation: string
}

export interface ContributingEventPreview {
  narrative_id: string
  timestamp: string
  source: string
  snippet: string
  weight: number
}

export interface TopicAggregate {
  id: string
  topic_label: string
  period_start: string
  period_end: string
  persistence_score: number
  authority_weighted_count: number
  top_contributing_events: ContributingEventPreview[]
}

export interface NarrativeEventWithTopics {
  id: string
  event_id: string
  source: string
  platform?: string
  speaker?: string
  speaker_role?: string
  audience_class?: string
  text: string
  timestamp: string
  event_type?: string
  provenance?: Record<string, unknown>
  raw_payload?: Record<string, unknown>
  topic_labels: TopicLabel[]
  primary_topic: string
  clustering_id: string | null
  authority_score?: number | null
  credibility_flags?: Record<string, unknown> | null
  /** Classification rationale (rule-based or embedding) */
  explanation?: string
}

export interface NarrativeIngestPayload {
  id?: string
  source: string
  platform: string
  speaker: string
  speaker_role?: string
  audience_class: string
  text: string
  timestamp: string
  event_type: string
  provenance: Record<string, unknown>
  raw_payload?: Record<string, unknown>
}

export interface NarrativesListParams {
  company_id?: string
  window_start?: string
  window_end?: string
  topics_only?: boolean
  limit?: number
  offset?: number
}

export interface NarrativesListResponse {
  items: NarrativeEventWithTopics[]
  total: number
}

export interface TopicsAggregateParams {
  company_id?: string
  window_start: string
  window_end: string
}

export interface TopicsAggregateResponse {
  items: TopicAggregate[]
}

/** Authority weights: Analyst > Media > Retail */
export const AUTHORITY_WEIGHTS: Record<string, number> = {
  analyst: 1.0,
  media: 0.7,
  retail: 0.4,
  institutional: 0.8,
  unknown: 0.5,
}
