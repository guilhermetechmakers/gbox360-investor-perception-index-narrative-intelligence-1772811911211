/**
 * Ingest Monitor API
 * Endpoints: metrics, errors, health, replay, dlq, transcript batch
 * Uses internal admin APIs or Supabase Edge Functions when configured.
 * Falls back to mock data for MVP when endpoints unavailable.
 */
import { api } from '@/lib/api'
import type {
  IngestMetricsResponse,
  IngestErrorsResponse,
  IngestHealthResponse,
  ReplayParams,
  ReplayResponse,
  DLQResponse,
  TranscriptBatchRequest,
  TranscriptBatchStatus,
  ReplayRequest,
} from '@/types/ingest'

const INGEST_BASE = '/ingest'

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

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback)
}

/** Mock data for MVP when API unavailable */
const MOCK_SOURCE_METRICS = [
  {
    id: 'news',
    name: 'NewsAPI',
    lastFetchAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    itemsProcessed: 120,
    errors: 0,
    retryCount: 0,
    rateLimitUsed: 85,
    rateLimitTotal: 100,
    status: 'healthy' as const,
    sparklineData: [80, 95, 110, 105, 120],
  },
  {
    id: 'social',
    name: 'X / Twitter',
    lastFetchAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    itemsProcessed: 340,
    errors: 0,
    retryCount: 0,
    rateLimitUsed: 420,
    rateLimitTotal: 450,
    status: 'healthy' as const,
    sparklineData: [280, 300, 320, 310, 340],
  },
  {
    id: 'transcript',
    name: 'Earnings transcripts',
    lastFetchAt: undefined,
    itemsProcessed: 0,
    errors: 0,
    retryCount: 0,
    rateLimitUsed: 0,
    rateLimitTotal: 0,
    status: 'healthy' as const,
  },
]

const MOCK_INGEST_ERRORS: IngestErrorsResponse['data'] = []

const MOCK_HEALTH_COMPONENTS = [
  { id: '1', component: 'Ingress', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
  { id: '2', component: 'DB', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
  { id: '3', component: 'Queue', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
  { id: '4', component: 'DLQ', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
  { id: '5', component: 'Auth', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
  { id: '6', component: 'API Gateway', status: 'healthy' as const, lastChecked: new Date().toISOString(), details: '' },
]

const MOCK_DLQ_ENTRIES: DLQResponse['data'] = []

export const ingestApi = {
  getMetrics: async (): Promise<IngestMetricsResponse> => {
    return safeGet(
      () => api.get<IngestMetricsResponse>(`${INGEST_BASE}/metrics`),
      { data: MOCK_SOURCE_METRICS, count: MOCK_SOURCE_METRICS.length }
    )
  },

  getErrors: async (params?: { page?: number; limit?: number }): Promise<IngestErrorsResponse> => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
    return safeGet(
      () => api.get<IngestErrorsResponse>(`${INGEST_BASE}/errors${qs}`),
      { data: MOCK_INGEST_ERRORS }
    )
  },

  getHealth: async (): Promise<IngestHealthResponse> => {
    return safeGet(
      () => api.get<IngestHealthResponse>(`${INGEST_BASE}/health`),
      { components: MOCK_HEALTH_COMPONENTS }
    )
  },

  triggerReplay: async (params: ReplayParams): Promise<ReplayResponse> => {
    return api.post<ReplayResponse>(`${INGEST_BASE}/replay`, params)
  },

  getDLQ: async (): Promise<DLQResponse> => {
    return safeGet(
      () => api.get<DLQResponse>(`${INGEST_BASE}/dlq`),
      { data: MOCK_DLQ_ENTRIES }
    )
  },

  retryDLQ: async (id: string, idempotencyKey: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>(`${INGEST_BASE}/dlq/retry`, { id, idempotencyKey })
  },

  purgeDLQ: async (id: string, idempotencyKey: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>(`${INGEST_BASE}/dlq/purge`, { id, idempotencyKey })
  },

  triggerBatch: async (idempotencyKey: string): Promise<{ success: boolean; jobId?: string }> => {
    return api.post<{ success: boolean; jobId?: string }>(`${INGEST_BASE}/trigger`, { idempotencyKey })
  },

  retryError: async (errorId: string, idempotencyKey: string): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>(`${INGEST_BASE}/errors/${errorId}/retry`, {
      idempotencyKey,
    })
  },

  /** Transcript batch ingestion - uses Supabase Edge Function when configured */
  submitTranscriptBatch: async (body: TranscriptBatchRequest): Promise<{ success: boolean; batch_id: string; job_id?: string }> => {
    if (FUNCTIONS_BASE) {
      const res = await supabaseFunction<{ success: boolean; batch_id: string; job_id?: string }>(
        'ingest-transcripts-batch',
        { method: 'POST', body }
      )
      return { success: res?.success ?? true, batch_id: res?.batch_id ?? body.batch_id, job_id: res?.job_id }
    }
    return api.post<{ success: boolean; batch_id: string; job_id?: string }>(
      `${INGEST_BASE}/transcripts/batch`,
      body
    )
  },

  getTranscriptBatchStatus: async (batchId: string): Promise<TranscriptBatchStatus> => {
    if (FUNCTIONS_BASE) {
      return safeGet(
        () => supabaseFunction<TranscriptBatchStatus>('ingest-batch-status', {
          searchParams: { batch_id: batchId },
        }),
        {
          batch_id: batchId,
          status: 'pending',
          total_items: 0,
          processed: 0,
          failed: 0,
          skipped: 0,
        }
      )
    }
    return safeGet(
      () => api.get<TranscriptBatchStatus>(`${INGEST_BASE}/transcripts/status/${encodeURIComponent(batchId)}`),
      {
        batch_id: batchId,
        status: 'pending',
        total_items: 0,
        processed: 0,
        failed: 0,
        skipped: 0,
      }
    )
  },

  /** Replay raw payload or narrative event */
  replayPayload: async (body: ReplayRequest): Promise<{ success: boolean; message?: string }> => {
    return api.post<{ success: boolean; message?: string }>(`${INGEST_BASE}/replay`, body)
  },
}
