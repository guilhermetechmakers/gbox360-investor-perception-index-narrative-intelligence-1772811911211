/**
 * Topic Classification & Narrative Persistence types
 * Aligns with Topic Classification & Narrative Persistence spec.
 */

/** Topic label with confidence score */
export interface TopicLabel {
  topic: string
  confidence: number
}

/** Contributing event preview for persistence aggregates */
export interface ContributingEventPreview {
  narrative_id: string
  timestamp: string
  source: string
  snippet: string
  weight: number
}

/** Per-topic persistence aggregate */
export interface TopicAggregate {
  id: string
  topic_label: string
  period_start: string
  period_end: string
  persistence_score: number
  authority_weighted_count: number
  top_contributing_events: ContributingEventPreview[]
}

/** Narrative event with topic classification (extends canonical) */
export interface NarrativeEventWithTopics {
  id: string
  event_id: string
  source: string
  platform: string
  speaker: string
  speaker_role: string
  audience_class: string
  text: string
  timestamp: string
  event_type: string
  provenance: Record<string, unknown>
  raw_payload: Record<string, unknown>
  topic_labels: TopicLabel[]
  primary_topic: string
  clustering_id: string | null
  explanation?: string
}

/** Topic classification result from classifier */
export interface TopicClassificationResult {
  top_topic_labels: TopicLabel[]
  primary_topic: string
  clustering_id: string | null
  explanation: string
}

/** Authority weights by audience class */
export const AUTHORITY_WEIGHTS: Record<string, number> = {
  analyst: 1.0,
  institutional: 0.85,
  media: 0.7,
  retail: 0.4,
  unknown: 0.3,
}

/** Default weight for unknown audience class */
export const DEFAULT_AUTHORITY_WEIGHT = 0.3

/** Narrative list query params */
export interface NarrativeListParams {
  company_id?: string
  window_start?: string
  window_end?: string
  topics_only?: boolean
  limit?: number
  offset?: number
}

/** Topics aggregate query params */
export interface TopicsAggregateParams {
  company_id?: string
  window_start: string
  window_end: string
}
