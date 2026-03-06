import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  IPISnapshot,
  NarrativeEvent,
  IPICalculateRequest,
  IPICalculateResponse,
  AuditProvenance,
} from '@/types/narrative'
import type { Movement, ExportAuditResponse } from '@/types/drilldown'
import type { PaginatedResponse } from '@/types/api'

const PROVISIONAL_WEIGHTS = { narrative: 0.4, credibility: 0.4, risk: 0.2 }

function mockCalculateIPI(
  companyId: string,
  windowStart: string,
  windowEnd: string,
  topN = 3
): IPICalculateResponse {
  const narrativeScore = 0.72
  const credibilityScore = 0.68
  const riskScore = 0.35
  const currentIPI =
    PROVISIONAL_WEIGHTS.narrative * narrativeScore +
    PROVISIONAL_WEIGHTS.credibility * credibilityScore +
    PROVISIONAL_WEIGHTS.risk * (1 - riskScore)
  const provenanceId = `prov-${companyId}-${windowStart}-${windowEnd}-${Date.now()}`
  const topNarratives = [
    { narrativeId: 'n1', label: 'Earnings guidance', contribution: 0.28, sourceRefs: ['news', 'transcript'] },
    { narrativeId: 'n2', label: 'Management tone', contribution: 0.22, sourceRefs: ['transcript'] },
    { narrativeId: 'n3', label: 'Analyst coverage', contribution: 0.18, sourceRefs: ['news'] },
  ].slice(0, topN)
  return {
    currentIPI: Math.round(currentIPI * 100) / 100,
    direction: 'UP',
    topNarratives,
    timestamp: new Date().toISOString(),
    provenanceId,
  }
}

function mockGetProvenance(provenanceId: string): AuditProvenance {
  const parts = provenanceId.split('-')
  return {
    provenanceId,
    companyId: parts[1] ?? 'unknown',
    windowStart: parts[2] ?? '',
    windowEnd: parts[3] ?? '',
    inputVector: {
      narrativeMetrics: { persistence: 0.72, authorityWeighted: 0.68 },
      credibilityProxies: { crossSourceRepetition: 0.7, managementConsistency: 0.65 },
      riskFlags: { keywordMatches: 0.35, volatilitySignal: 0.3 },
    },
    weightsUsed: PROVISIONAL_WEIGHTS,
    computedIPI: 0.68,
    timestamp: new Date().toISOString(),
  }
}

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

  /** GET /api/companies/:companyId/ipi-detail — spec endpoint; falls back to snapshot */
  getIPIDetail: async (
    companyId: string,
    startDate: string,
    endDate: string,
    limit?: number,
    offset?: number
  ): Promise<IPISnapshot> => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(limit != null && { limit: String(limit) }),
        ...(offset != null && { offset: String(offset) }),
      })
      const res = await api.get<{
        currentValue?: number
        direction?: 'up' | 'down' | 'flat'
        timestamp?: string
        topNarratives?: Array<{ narrativeId: string; title: string; score: number; credibility?: number }>
        timeline?: unknown[]
      }>(`/api/companies/${encodeURIComponent(companyId)}/ipi-detail?${params}`)
      const top = Array.isArray(res?.topNarratives) ? res.topNarratives : []
      return {
        company_id: companyId,
        company_name: '',
        score: res?.currentValue ?? 0,
        direction: res?.direction ?? 'flat',
        percent_change: 0,
        breakdown: { narrative: 0.4, credibility: 0.4, risk: 0.2 },
        top_narratives: top.map((n) => ({
          id: n.narrativeId,
          label: n.title,
          persistence: n.score,
          contribution: n.score,
          event_count: 0,
          company_id: companyId,
          window_start: startDate,
          window_end: endDate,
        })),
        window_start: startDate,
        window_end: endDate,
        weight_version: 'provisional-v1',
        timestamp: res?.timestamp,
      }
    } catch {
      return api.get<IPISnapshot>(
        `/ipi/snapshot?company_id=${encodeURIComponent(companyId)}&window_start=${encodeURIComponent(startDate)}&window_end=${encodeURIComponent(endDate)}`
      )
    }
  },

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
      sort?: 'asc' | 'desc'
      sortBy?: 'timestamp' | 'source' | 'authority'
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
      ...(filters?.sort && { sort: filters.sort }),
      ...(filters?.sortBy && { sort_by: filters.sortBy }),
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

  /** POST /api/export/audit — signed artifact URLs and metadata (spec endpoint) */
  postExportAudit: async (body: {
    companyId: string
    narrativeId?: string
    timeWindow: { start: string; end: string }
    format: 'json' | 'pdf'
  }): Promise<ExportAuditResponse> =>
    api.post<ExportAuditResponse>('/api/export/audit', body),

  /** POST /ipi/calculate - on-demand IPI computation with provenance */
  calculate: async (
    params: IPICalculateRequest
  ): Promise<IPICalculateResponse> => {
    const { companyId, windowStart, windowEnd, topN = 3 } = params
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<IPICalculateResponse>('ipi-calculate', {
          body: { companyId, windowStart, windowEnd, topN },
        })
        if (!error && data) return data
      } catch {
        // Fall through to REST API or mock
      }
    }
    try {
      const res = await api.post<IPICalculateResponse | { data?: IPICalculateResponse }>(
        '/ipi/calculate',
        { companyId, windowStart, windowEnd, topN }
      )
      const data = res && typeof res === 'object' && 'data' in res ? (res as { data?: IPICalculateResponse }).data : res
      if (data) return data as IPICalculateResponse
    } catch {
      // Fall through to mock
    }
    return mockCalculateIPI(companyId, windowStart, windowEnd, topN)
  },

  /** GET /provenance/:provenanceId - full audit payload for drill-down */
  getProvenance: async (provenanceId: string): Promise<AuditProvenance> => {
    if (!provenanceId) throw new Error('provenanceId is required')
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<AuditProvenance>('ipi-provenance', {
          body: { provenanceId },
        })
        if (!error && data) return data
      } catch {
        // Fall through
      }
    }
    try {
      const res = await api.get<AuditProvenance | { data?: AuditProvenance }>(
        `/provenance/${encodeURIComponent(provenanceId)}`
      )
      const data = res && typeof res === 'object' && 'data' in res ? (res as { data?: AuditProvenance }).data : res
      if (data) return data as AuditProvenance
    } catch {
      // Fall through to mock
    }
    return mockGetProvenance(provenanceId)
  },
}
