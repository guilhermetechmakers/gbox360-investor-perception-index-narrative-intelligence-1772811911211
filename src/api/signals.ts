/**
 * Credibility Proxy & Risk Signals API
 * Uses Supabase Edge Functions when configured.
 */
import { supabase } from '@/lib/supabase'
import type { RecomputeSignalsRequest, RecomputeSignalsResponse } from '@/types/signals'

const supabaseUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string) ?? '' : ''
const supabaseAnonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ?? '' : ''
const FUNCTIONS_BASE = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : ''

async function supabaseFunction<T>(
  name: string,
  options: { method?: string; body?: unknown }
): Promise<T> {
  if (!FUNCTIONS_BASE) {
    throw new Error('Supabase is not configured. Signals API requires Supabase Edge Functions.')
  }
  const { method = 'POST', body } = options
  const url = `${FUNCTIONS_BASE}/${name}`
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

export const signalsApi = {
  /**
   * POST /signals-recompute - trigger re-scoring for a time window or set of narratives
   */
  recompute: async (params: RecomputeSignalsRequest): Promise<RecomputeSignalsResponse> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<RecomputeSignalsResponse>(
          'signals-recompute',
          { body: params }
        )
        if (!error && data) return data
      } catch {
        // Fall through to direct fetch
      }
    }
    return supabaseFunction<RecomputeSignalsResponse>('signals-recompute', {
      method: 'POST',
      body: params,
    })
  },
}
