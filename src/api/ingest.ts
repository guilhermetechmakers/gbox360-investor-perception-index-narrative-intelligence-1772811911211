/**
 * Ingest Monitor API
 * Endpoints: metrics, errors, health, replay, dlq
 * Uses internal admin APIs; falls back to mock data for MVP when endpoints unavailable.
 */
import { api } from '@/lib/api'
import type {
  IngestMetricsResponse,
  IngestErrorsResponse,
  IngestHealthResponse,
  ReplayParams,
  ReplayResponse,
  DLQResponse,
} from '@/types/ingest'

const INGEST_BASE = '/ingest'

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
}
