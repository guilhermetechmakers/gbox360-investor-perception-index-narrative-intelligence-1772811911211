/**
 * Narratives API - Topic Classification & Narrative Persistence
 * Uses Supabase Edge Functions when configured.
 */
import type {
  NarrativeEventWithTopics,
  NarrativeListParams,
} from '@/types/topic-persistence'

const supabaseUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string) ?? '' : ''
const supabaseAnonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ?? '' : ''
const FUNCTIONS_BASE = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : ''

async function supabaseFunction<T>(
  name: string,
  options: { method?: string; body?: unknown; searchParams?: Record<string, string> }
): Promise<T> {
  if (!FUNCTIONS_BASE) {
    throw new Error('Supabase is not configured. Topic classification requires Supabase Edge Functions.')
  }
  const { method = 'GET', body, searchParams } = options
  const qs = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : ''
  const url = `${FUNCTIONS_BASE}/${name}${qs}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (supabaseAnonKey) headers['Authorization'] = `Bearer ${supabaseAnonKey}`
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err?.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const narrativesApi = {
  list: async (params?: NarrativeListParams) => {
    const searchParams: Record<string, string> = {}
    if (params?.company_id) searchParams.company_id = params.company_id
    if (params?.window_start) searchParams.window_start = params.window_start
    if (params?.window_end) searchParams.window_end = params.window_end
    if (params?.limit != null) searchParams.limit = String(params.limit)
    if (params?.offset != null) searchParams.offset = String(params.offset)

    const res = await supabaseFunction<{ items: unknown[]; total: number }>(
      'narratives',
      { method: 'GET', searchParams: Object.keys(searchParams).length ? searchParams : undefined }
    )
    const items = Array.isArray(res?.items) ? res.items : []
    const total = res?.total ?? items.length
    return {
      items: items.map((row) => ({
        id: (row as Record<string, unknown>)?.event_id ?? (row as Record<string, unknown>)?.id ?? '',
        event_id: (row as Record<string, unknown>)?.event_id ?? '',
        source: (row as Record<string, unknown>)?.source ?? 'unknown',
        platform: (row as Record<string, unknown>)?.platform ?? 'unknown',
        speaker: (row as Record<string, unknown>)?.speaker ?? 'unknown',
        speaker_role: (row as Record<string, unknown>)?.speaker_role ?? 'unknown',
        audience_class: (row as Record<string, unknown>)?.audience_class ?? 'unknown',
        text: (row as Record<string, unknown>)?.text ?? '',
        timestamp: (row as Record<string, unknown>)?.timestamp ?? '',
        event_type: 'narrative',
        provenance: ((row as Record<string, unknown>)?.provenance as Record<string, unknown>) ?? {},
        raw_payload: ((row as Record<string, unknown>)?.metadata ?? {}) as Record<string, unknown>,
        topic_labels: (() => {
          const r = row as Record<string, unknown>
          const raw = r?.topic_labels
          const arr = Array.isArray(raw) ? raw : []
          return arr.map((t: unknown) => {
            const o = t as Record<string, unknown>
            return { topic: String(o?.topic ?? 'unknown'), confidence: Number(o?.confidence ?? 0) }
          })
        })(),
        primary_topic: (row as Record<string, unknown>)?.primary_topic ?? 'unknown',
        clustering_id: (row as Record<string, unknown>)?.clustering_id ?? null,
      })) as NarrativeEventWithTopics[],
      total,
    }
  },

  get: async (id: string): Promise<NarrativeEventWithTopics | null> => {
    const res = await supabaseFunction<NarrativeEventWithTopics | null>('narratives', {
      method: 'GET',
      searchParams: { id },
    })
    return res ?? null
  },

  ingest: async (payload: Record<string, unknown>): Promise<{ event_id: string; success: boolean }> => {
    const res = await supabaseFunction<{ event_id: string; success: boolean }>('narratives', {
      method: 'POST',
      body: payload,
    })
    return res ?? { event_id: '', success: false }
  },
}
