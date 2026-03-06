/**
 * Topics Aggregate API - Per-topic persistence metrics
 * GET /topics/aggregate - fetch per-topic persistence scores and top contributing events
 * Uses Supabase Edge Functions when configured.
 */
import { api } from '@/lib/api'
import { ensureArray } from '@/lib/runtime-safe'
import type {
  TopicAggregate,
  TopicsAggregateParams,
  TopicsAggregateResponse,
} from '@/types/topic-classification'

const supabaseUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string) ?? '' : ''
const supabaseAnonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ?? '' : ''
const FUNCTIONS_BASE = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : ''

async function supabaseFunction<T>(
  name: string,
  options: { method?: string; searchParams?: Record<string, string> }
): Promise<T> {
  const { method = 'GET', searchParams } = options
  const qs = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : ''
  const url = `${FUNCTIONS_BASE}/${name}${qs}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (supabaseAnonKey) headers['Authorization'] = `Bearer ${supabaseAnonKey}`
  const res = await fetch(url, {
    method,
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err?.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const topicsApi = {
  /** GET /topics/aggregate - fetch per-topic persistence metrics */
  getAggregate: async (params: TopicsAggregateParams): Promise<TopicsAggregateResponse> => {
    const searchParams: Record<string, string> = {
      company_id: params.company_id,
      window_start: params.window_start,
      window_end: params.window_end,
    }

    if (FUNCTIONS_BASE) {
      const res = await supabaseFunction<{ items: TopicAggregate[] }>('topics-aggregate', {
        method: 'GET',
        searchParams,
      })
      const items = ensureArray(res?.items)
      return { items }
    }
    try {
      const qs = new URLSearchParams(searchParams).toString()
      const res = await api.get<TopicsAggregateResponse | { data?: TopicAggregate[] }>(
        `/topics/aggregate?${qs}`
      )
      const items = Array.isArray((res as { data?: TopicAggregate[] })?.data)
        ? (res as { data: TopicAggregate[] }).data
        : Array.isArray((res as TopicsAggregateResponse)?.items)
          ? (res as TopicsAggregateResponse).items
          : []
      return { items }
    } catch {
      return { items: [] }
    }
  },
}
