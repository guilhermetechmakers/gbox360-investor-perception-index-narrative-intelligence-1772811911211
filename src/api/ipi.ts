import { api } from '@/lib/api'
import type { IPISnapshot, NarrativeEvent } from '@/types/narrative'
import type { Movement } from '@/types/drilldown'
import type { PaginatedResponse } from '@/types/api'

export const ipiApi = {
  getMovement: async (
    narrativeId: string,
    companyId?: string,
    windowStart?: string,
    windowEnd?: string
  ): Promise<Movement | null> => {
    try {
      const params = new URLSearchParams({ narrative_id: narrativeId })
      if (companyId) params.set('company_id', companyId)
      if (windowStart) params.set('window_start', windowStart)
      if (windowEnd) params.set('window_end', windowEnd)
      const res = await api.get<{ data?: Movement | null } | Movement>(
        `/ipi/movement?${params}`
      )
      const data = res && typeof res === 'object' && 'data' in res ? res.data : res
      return (data as Movement) ?? null
    } catch {
      return null
    }
  },

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
    filters?: {
      source?: string
      authority_min?: number
      date_start?: string
      date_end?: string
    }
  ): Promise<PaginatedResponse<NarrativeEvent>> => {
    const params = new URLSearchParams({
      narrative_id: narrativeId,
      page: String(page),
      limit: String(limit),
      ...(filters?.source && { source: filters.source }),
      ...(filters?.authority_min != null && {
        authority_min: String(filters.authority_min),
      }),
      ...(filters?.date_start && { date_start: filters.date_start }),
      ...(filters?.date_end && { date_end: filters.date_end }),
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
