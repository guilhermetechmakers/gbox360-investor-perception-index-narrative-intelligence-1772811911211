import { api } from '@/lib/api'
import type { IPISnapshot, NarrativeEvent } from '@/types/narrative'
import type { PaginatedResponse } from '@/types/api'

export const ipiApi = {
  getSnapshot: async (
    companyId: string,
    windowStart: string,
    windowEnd: string
  ): Promise<IPISnapshot> =>
    api.get<IPISnapshot>(
      `/ipi/snapshot?company_id=${encodeURIComponent(companyId)}&window_start=${encodeURIComponent(windowStart)}&window_end=${encodeURIComponent(windowEnd)}`
    ),

  getDashboardCards: async (
    companyIds: string[],
    windowStart: string,
    windowEnd: string
  ): Promise<IPISnapshot[]> =>
    api.post<IPISnapshot[]>('/ipi/dashboard-cards', {
      company_ids: companyIds,
      window_start: windowStart,
      window_end: windowEnd,
    }),

  getNarrativeEvents: async (
    narrativeId: string,
    page: number,
    limit: number,
    filters?: { source?: string; authority_min?: number }
  ): Promise<PaginatedResponse<NarrativeEvent>> => {
    const params = new URLSearchParams({
      narrative_id: narrativeId,
      page: String(page),
      limit: String(limit),
      ...(filters?.source && { source: filters.source }),
      ...(filters?.authority_min != null && {
        authority_min: String(filters.authority_min),
      }),
    })
    return api.get<PaginatedResponse<NarrativeEvent>>(
      `/ipi/narrative-events?${params}`
    )
  },

  getRawPayload: async (rawPayloadId: string): Promise<unknown> =>
    api.get<unknown>(`/ipi/raw-payload/${rawPayloadId}`),

  requestExport: async (
    companyId: string,
    windowStart: string,
    windowEnd: string,
    options?: { format: 'json' | 'pdf' | 'both' }
  ): Promise<{ job_id: string; message: string }> =>
    api.post<{ job_id: string; message: string }>('/ipi/export', {
      company_id: companyId,
      window_start: windowStart,
      window_end: windowEnd,
      ...options,
    }),
}
