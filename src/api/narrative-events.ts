/**
 * Narrative Events API
 * Canonical append-only narrative events - list, get, ingest, replay, validation.
 * Uses Supabase Edge Functions when configured.
 */
import type {
  CanonicalNarrativeEvent,
  CanonicalNarrativeEventInsert,
  NarrativeEventListParams,
  NarrativeEventListResponse,
  ReplayStatusResponse,
} from '@/types/narrative-event-canonical'

const supabaseUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string) ?? '' : ''
const supabaseAnonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ?? '' : ''
const FUNCTIONS_BASE = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : ''

async function supabaseFunction<T>(
  name: string,
  options: { method?: string; body?: unknown; searchParams?: Record<string, string> }
): Promise<T> {
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

export const narrativeEventsApi = {
  list: async (params?: NarrativeEventListParams): Promise<NarrativeEventListResponse> => {
    const searchParams: Record<string, string> = {}
    if (params?.company) searchParams.company = params.company
    if (params?.start) searchParams.start = params.start
    if (params?.end) searchParams.end = params.end
    if (params?.source) searchParams.source = params.source
    if (params?.platform) searchParams.platform = params.platform
    if (params?.audience_class) searchParams.audience_class = params.audience_class
    if (params?.limit != null) searchParams.limit = String(params.limit)
    if (params?.offset != null) searchParams.offset = String(params.offset)
    if (params?.sort) searchParams.sort = params.sort
    if (params?.order) searchParams.order = params.order

    const res = await supabaseFunction<{ items: CanonicalNarrativeEvent[]; total: number }>(
      'narrative-events',
      { method: 'GET', searchParams: Object.keys(searchParams).length ? searchParams : undefined }
    )
    const items = Array.isArray(res?.items) ? res.items : []
    const total = res?.total ?? items.length
    return { items, total }
  },

  get: async (eventId: string): Promise<CanonicalNarrativeEvent | null> => {
    const res = await supabaseFunction<CanonicalNarrativeEvent>('narrative-events', {
      method: 'GET',
      searchParams: { event_id: eventId },
    })
    return res ?? null
  },

  ingest: async (payload: CanonicalNarrativeEventInsert): Promise<{ event_id: string; success: boolean }> => {
    const res = await supabaseFunction<{ event_id: string; success: boolean }>('narrative-events', {
      method: 'POST',
      body: payload,
    })
    return res ?? { event_id: '', success: false }
  },

  triggerReplay: async (): Promise<{ success: boolean; message?: string }> => {
    return supabaseFunction<{ success: boolean; message?: string }>('narrative-events-replay', {
      method: 'POST',
    })
  },

  getReplayStatus: async (): Promise<ReplayStatusResponse> => {
    const res = await supabaseFunction<{
      status: string
      progress?: number
      message?: string | null
      lastCompletedAt?: string | null
    }>('narrative-events-replay', { method: 'GET' })
    if (!res) return { status: 'idle' }
    return {
      status: (res.status as ReplayStatusResponse['status']) ?? 'idle',
      completed_at: res.lastCompletedAt ?? undefined,
      error_message:
        res.status === 'failed' ? (res.message ?? undefined) : undefined,
    }
  },

  validate: async (payload: Record<string, unknown>): Promise<{ valid: boolean; errors: string[] }> => {
    const res = await supabaseFunction<{ valid: boolean; errors: string[] }>('narrative-events-validation', {
      method: 'POST',
      body: payload,
    })
    return res ?? { valid: false, errors: ['Validation request failed'] }
  },
}
