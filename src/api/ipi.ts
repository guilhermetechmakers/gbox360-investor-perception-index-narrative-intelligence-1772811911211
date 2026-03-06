import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  IPISnapshot,
  NarrativeEvent,
  IPICalculateRequest,
  IPICalculateResponse,
  AuditProvenance,
} from '@/types/narrative'
import type { Movement } from '@/types/drilldown'
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
