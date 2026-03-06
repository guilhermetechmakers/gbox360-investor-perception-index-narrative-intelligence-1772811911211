/**
 * Admin Dashboard API
 * Endpoints: ingestion-status, system-health, admin-actions, ingest-monitor, payloads, audit-exports
 * Uses internal admin APIs; falls back to mock data for MVP when endpoints unavailable.
 */
import { api } from '@/lib/api'
import type {
  IngestionSource,
  IngestionStatusResponse,
  SystemQueue,
  SystemHealthResponse,
  AdminAction,
  AdminActionsResponse,
  RawPayload,
  PayloadsResponse,
  PayloadSearchFilters,
  PayloadDetailResponse,
  ProvenanceData,
  GenerateAuditExportParams,
  AuditExportResponse,
  SignEventsParams,
  SignEventsResponse,
} from '@/types/admin'

const ADMIN_BASE = '/admin'

/** Admin notification for SLA alerts and critical events */
export interface AdminNotification {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged?: boolean
  actionUrl?: string
}

/** Ingest monitor source metrics */
export interface IngestMonitorSource {
  id: string
  name: string
  queueSize: number
  rate: number
  errors: number
  lastRetry?: string
  lastFetch?: string
  sparklineData?: number[]
}

/** Mock data for MVP when API unavailable */
const MOCK_INGESTION_SOURCES: IngestionSource[] = [
  {
    id: 'news',
    name: 'NewsAPI',
    lastIngestTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    throughput: 120,
    errorCount: 0,
    rateLimit: 100,
    rateLimitWarnings: [],
    status: 'healthy',
  },
  {
    id: 'social',
    name: 'X / Twitter',
    lastIngestTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    throughput: 340,
    errorCount: 0,
    rateLimit: 450,
    rateLimitWarnings: [],
    status: 'healthy',
  },
  {
    id: 'transcript',
    name: 'Earnings transcripts',
    lastIngestTime: undefined,
    throughput: 0,
    errorCount: 0,
    status: 'healthy',
  },
]

const MOCK_QUEUES: SystemQueue[] = [
  { id: 'news-q', name: 'News queue', depth: 0, errorCount: 0, retryCount: 0 },
  { id: 'social-q', name: 'Social queue', depth: 0, errorCount: 0, retryCount: 0 },
  { id: 'dlq', name: 'Dead letter queue', depth: 0, errorCount: 0, retryCount: 0 },
]

const MOCK_ADMIN_ACTIONS: AdminAction[] = [
  {
    id: '1',
    actionType: 'resend_verification',
    userId: 'u1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    details: { email: 'user@example.com' },
  },
  {
    id: '2',
    actionType: 'export_audit',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: { format: 'json' },
  },
]

const MOCK_PAYLOADS: RawPayload[] = []

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback)
}

export const adminDashboardApi = {
  getIngestionStatus: async (): Promise<IngestionStatusResponse> => {
    return safeGet(
      () => api.get<IngestionStatusResponse>(`${ADMIN_BASE}/ingestion-status`),
      { sources: MOCK_INGESTION_SOURCES }
    )
  },

  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    return safeGet(
      () => api.get<SystemHealthResponse>(`${ADMIN_BASE}/system-health`),
      { queues: MOCK_QUEUES, healthScore: 100 }
    )
  },

  getAdminActions: async (params?: { limit?: number; actionType?: string }): Promise<AdminActionsResponse> => {
    const qs = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : ''
    return safeGet(
      () => api.get<AdminActionsResponse>(`${ADMIN_BASE}/admin-actions${qs}`),
      { actions: MOCK_ADMIN_ACTIONS }
    )
  },

  getPayloads: async (params?: PayloadSearchFilters): Promise<PayloadsResponse> => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
    return safeGet(
      () => api.get<PayloadsResponse>(`${ADMIN_BASE}/payloads${qs}`),
      { data: MOCK_PAYLOADS, count: 0, total: 0, page: 1, limit: 20 }
    )
  },

  getPayloadDetail: async (id: string): Promise<PayloadDetailResponse> => {
    return safeGet(
      () => api.get<PayloadDetailResponse>(`${ADMIN_BASE}/payloads/${id}`),
      {
        payload: {
          id,
          timestamp: new Date().toISOString(),
          source: 'unknown',
          rawPayload: '{}',
        },
        provenance: { events: [] },
        narrativeEvents: [],
      }
    )
  },

  replayPayload: async (id: string): Promise<{ success: boolean; jobId?: string; message?: string }> => {
    return api.post<{ success: boolean; jobId?: string; message?: string }>(
      `${ADMIN_BASE}/payloads/${id}/replay`,
      {}
    )
  },

  replayPayloadsBatch: async (payloadIds: string[]): Promise<{
    success: boolean
    jobId?: string
    scheduledCount?: number
  }> => {
    return api.post<{ success: boolean; jobId?: string; scheduledCount?: number }>(
      `${ADMIN_BASE}/payloads/replay`,
      { payloadIds }
    )
  },

  getPayloadProvenance: async (id: string): Promise<ProvenanceData> => {
    return safeGet(
      () => api.get<ProvenanceData>(`${ADMIN_BASE}/payloads/${id}/provenance`),
      { events: [] }
    )
  },

  setPayloadRetention: async (id: string, retain: boolean): Promise<{ success: boolean }> => {
    return api.patch<{ success: boolean }>(`${ADMIN_BASE}/payloads/${id}/retention`, { retain })
  },

  purgePayload: async (id: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`${ADMIN_BASE}/payloads/${id}`)
  },

  generateAuditExport: async (params: GenerateAuditExportParams): Promise<AuditExportResponse> => {
    return api.post<AuditExportResponse>(`${ADMIN_BASE}/audit/export`, params)
  },

  getAuditExport: async (exportId: string): Promise<{
    signedArtifactJson?: unknown
    pdfBlobUrl?: string
    status: string
  }> => {
    return api.get<Record<string, unknown>>(`${ADMIN_BASE}/audit/export/${exportId}`) as Promise<{
      signedArtifactJson?: unknown
      pdfBlobUrl?: string
      status: string
    }>
  },

  signEvents: async (params: SignEventsParams): Promise<SignEventsResponse> => {
    return api.post<SignEventsResponse>(`${ADMIN_BASE}/audit-exports/sign-events`, params)
  },

  getIngestMonitor: async (): Promise<{ sources: IngestMonitorSource[] }> => {
    const mockSources: IngestMonitorSource[] = [
      {
        id: 'news',
        name: 'NewsAPI',
        queueSize: 0,
        rate: 120,
        errors: 0,
        lastFetch: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        sparklineData: [80, 95, 110, 105, 120],
      },
      {
        id: 'social',
        name: 'X / Twitter',
        queueSize: 0,
        rate: 340,
        errors: 0,
        lastFetch: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        sparklineData: [280, 300, 320, 310, 340],
      },
      {
        id: 'transcript',
        name: 'Earnings transcripts',
        queueSize: 0,
        rate: 0,
        errors: 0,
        lastFetch: undefined,
      },
    ]
    return safeGet(
      () => api.get<{ sources: IngestMonitorSource[] }>(`${ADMIN_BASE}/ingest-monitor`),
      { sources: mockSources }
    )
  },
}
