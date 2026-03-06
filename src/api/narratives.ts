/**
 * Narratives API - Credibility & Risk Signals
 * POST /narratives (ingest), GET /narratives/:id, GET /narratives (list), POST /signals/recompute
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { NarrativeEventWithTopics } from '@/types/topic-classification'
import type {
  NarrativeIngestPayload,
  NarrativeIngestResponse,
  NarrativeWithSignalsResponse,
  RecomputeSignalsRequest,
  RecomputeSignalsResponse,
} from '@/types/signals'

function ensureArray<T>(data: T[] | null | undefined): T[] {
  if (data == null) return []
  return Array.isArray(data) ? data : []
}

export const narrativesApi = {
  /** POST /narratives - ingest narrative; triggers signal computation */
  postNarrative: async (
    payload: NarrativeIngestPayload & { source?: string; provenance: Record<string, unknown> }
  ): Promise<NarrativeIngestResponse> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<NarrativeIngestResponse>('narratives', {
          method: 'POST',
          body: {
            raw_text: payload.raw_text,
            text: payload.raw_text,
            source: payload.source_platform ?? payload.source ?? 'unknown',
            platform: payload.source_platform ?? 'unknown',
            speaker: payload.speaker_entity ?? 'unknown',
            speaker_role: payload.speaker_role ?? 'unknown',
            audience_class: payload.audience_class ?? 'unknown',
            timestamp: payload.event_time,
            provenance: payload.provenance ?? { write_timestamp: new Date().toISOString() },
            raw_payload: {},
          },
        })
        if (!error && data) return data
      } catch {
        // fall through to REST
      }
    }
    const res = await api.post<NarrativeIngestResponse & { event_id?: string }>('/narratives', {
      raw_text: payload.raw_text,
      text: payload.raw_text,
      source: payload.source_platform ?? payload.source ?? 'unknown',
      provenance: payload.provenance ?? { write_timestamp: new Date().toISOString() },
    })
    const narrative_id = res?.narrative_id ?? (res as { event_id?: string })?.event_id ?? ''
    return {
      narrative_id,
      credibility_score: (res as NarrativeIngestResponse)?.credibility_score ?? 0,
      risk_score: (res as NarrativeIngestResponse)?.risk_score ?? 0,
      signals: ensureArray((res as NarrativeIngestResponse)?.signals),
    }
  },

  /** GET /narratives?id= - fetch single narrative with signals */
  getNarrative: async (id: string): Promise<NarrativeEventWithTopics | null> => {
    if (!id) return null
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<NarrativeEventWithTopics>('narratives', {
          method: 'GET',
          body: {},
        })
        if (!error && data) return data as NarrativeEventWithTopics
      } catch {
        // fall through
      }
    }
    try {
      const res = await api.get<NarrativeEventWithTopics | { data?: NarrativeEventWithTopics }>(
        `/narratives?id=${encodeURIComponent(id)}`
      )
      const out = res && typeof res === 'object' && 'data' in res ? (res as { data?: NarrativeEventWithTopics }).data : res
      return (out as NarrativeEventWithTopics) ?? null
    } catch {
      return null
    }
  },

  /** GET /narratives - list with pagination and filters */
  getNarratives: async (params: {
    company_id?: string
    window_start?: string
    window_end?: string
    limit?: number
    offset?: number
  }): Promise<{ items: NarrativeEventWithTopics[]; total: number }> => {
    const q = new URLSearchParams()
    if (params.company_id) q.set('company_id', params.company_id)
    if (params.window_start) q.set('window_start', params.window_start)
    if (params.window_end) q.set('window_end', params.window_end)
    if (params.limit != null) q.set('limit', String(params.limit))
    if (params.offset != null) q.set('offset', String(params.offset))

    function toNarrativeEventWithTopics(raw: Record<string, unknown>): NarrativeEventWithTopics {
      const eventId = String(raw.event_id ?? raw.id ?? '')
      return {
        id: eventId,
        event_id: eventId,
        source: String(raw.source ?? 'unknown'),
        platform: String(raw.platform ?? 'unknown'),
        speaker: String((raw as { speaker?: string }).speaker ?? (raw as { speaker_entity?: string }).speaker_entity ?? 'unknown'),
        speaker_role: String((raw as { speaker_role?: string }).speaker_role ?? 'unknown'),
        audience_class: String((raw as { audience_class?: string }).audience_class ?? 'unknown'),
        text: String(raw.text ?? raw.raw_text ?? ''),
        timestamp: String(raw.timestamp ?? raw.original_timestamp ?? ''),
        event_type: String((raw as { event_type?: string }).event_type ?? 'narrative'),
        provenance: (raw.provenance as Record<string, unknown>) ?? {},
        raw_payload: (raw.raw_payload as Record<string, unknown>) ?? {},
        topic_labels: Array.isArray(raw.topic_labels) ? raw.topic_labels as { topic: string; confidence: number }[] : [],
        primary_topic: String(raw.primary_topic ?? 'unknown'),
        clustering_id: raw.clustering_id != null ? String(raw.clustering_id) : null,
        authority_score: raw.authority_score != null ? Number(raw.authority_score) : null,
        credibility_flags: (raw.credibility_flags as Record<string, unknown> | null | undefined) ?? undefined,
        explanation: raw.explanation != null && raw.explanation !== '' ? String(raw.explanation) : undefined,
      }
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<NarrativeWithSignalsResponse>('narratives', {
          method: 'GET',
          body: {},
        })
        if (!error && data) {
          const rawItems = (ensureArray(data?.items) as unknown) as Record<string, unknown>[]
          const items = rawItems.map(toNarrativeEventWithTopics)
          return { items, total: (data?.total ?? items.length) as number }
        }
      } catch {
        // fall through
      }
    }
    try {
      const res = await api.get<NarrativeWithSignalsResponse & { items?: unknown[]; total?: number }>(
        `/narratives?${q.toString()}`
      )
      const rawItems = ensureArray(res?.items) as unknown as Record<string, unknown>[]
      const items = rawItems.map(toNarrativeEventWithTopics)
      return { items, total: res?.total ?? items.length }
    } catch {
      return { items: [], total: 0 }
    }
  },

  /** POST /signals/recompute - re-score for narrative set or window */
  postSignalsRecompute: async (body: RecomputeSignalsRequest): Promise<RecomputeSignalsResponse> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<RecomputeSignalsResponse>('signals-recompute', {
          body,
        })
        if (!error && data) return data
      } catch {
        // fall through
      }
    }
    const res = await api.post<RecomputeSignalsResponse>('/signals/recompute', body)
    return { updated_count: res?.updated_count ?? 0 }
  },
}
