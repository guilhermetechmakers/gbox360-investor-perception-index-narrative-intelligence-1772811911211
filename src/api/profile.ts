import { api } from '@/lib/api'
import type {
  ProfileActivityItem,
  ProvisionalWeightPreviewInput,
  ProvisionalWeightPreviewResult,
} from '@/types/profile'

function normalizeActivityItem(raw: unknown): ProfileActivityItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : `act-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const userId = typeof o.userId === 'string' ? o.userId : ''
  const action = typeof o.action === 'string' ? o.action : ''
  const desc = typeof o.description === 'string' ? o.description : action
  const timestamp = typeof o.timestamp === 'string' ? o.timestamp : ''
  if (!timestamp) return null
  const type = (typeof o.type === 'string' ? o.type : 'company_view') as ProfileActivityItem['type']
  return {
    id,
    userId,
    type,
    description: desc || 'Activity',
    timestamp,
    source: typeof o.source === 'string' ? o.source : undefined,
    metadata: typeof o.metadata === 'object' && o.metadata ? (o.metadata as Record<string, unknown>) : undefined,
  }
}

/** User profile API - activity, provisional weight preview */

export const profileApi = {
  getActivity: async (limit = 20): Promise<ProfileActivityItem[]> => {
    try {
      const res = await api.get<ProfileActivityItem[] | { data?: unknown[] } | unknown[]>(
        `/users/me/activity?limit=${limit}`
      )
      const data = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data
      const arr = Array.isArray(data) ? data : []
      return arr.map(normalizeActivityItem).filter((x): x is ProfileActivityItem => x !== null)
    } catch {
      return []
    }
  },

  getProvisionalWeightPreview: async (
    input: ProvisionalWeightPreviewInput
  ): Promise<ProvisionalWeightPreviewResult | null> => {
    try {
      const res = await api.post<ProvisionalWeightPreviewResult | null>(
        '/settings/weights/preview',
        input
      )
      return res ?? null
    } catch {
      const { narrative = 40, credibility = 40, risk = 20 } = input.weights ?? {}
      const total = narrative + credibility + risk
      const scale = total > 0 ? 100 / total : 1
      const n = (narrative * scale) / 100
      const c = (credibility * scale) / 100
      const r = (risk * scale) / 100
      const baseScore = 65
      const score = Math.round(
        Math.min(100, Math.max(0, baseScore * (0.4 * n + 0.4 * c + 0.2 * (1 - r))))
      )
      const prevScore = Math.round(baseScore * (0.4 * 0.4 + 0.4 * 0.4 + 0.2 * 0.8))
      return {
        score,
        delta: score - prevScore,
        narrative: Math.round(n * 100),
        credibility: Math.round(c * 100),
        risk: Math.round(r * 100),
      }
    }
  },
}
