/**
 * User Profile & Account Management API
 * Maps to spec endpoints: GET/PUT/PATCH profile, password, saved-companies, preferences,
 * provisional-weights, export, delete, audit logs.
 */
import { api } from '@/lib/api'

export interface UserProfilePayload {
  name?: string
  avatar_url?: string
  locale?: string
  timezone?: string
  metadata?: Record<string, unknown>
}

export interface UserPreferencesPayload {
  ingestNotifications?: boolean
  weeklySummary?: boolean
  exportNotifications?: boolean
  emailDigest?: boolean
  pushEnabled?: boolean
}

export interface ProvisionalWeightsPayload {
  narrative: number
  credibility: number
  risk: number
}

export interface ProvisionalWeightPreviewResult {
  score: number
  delta: number
  narrative: number
  credibility: number
  risk: number
}

export interface ExportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  artifact_url?: string | null
  created_at: string
  updated_at?: string
}

export interface AuditLogItem {
  id: string
  user_id: string
  action_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface SavedCompanyItem {
  id: string
  company_id: string
  saved_at: string
  company?: { id: string; name: string; ticker?: string }
}

/** User profile API - spec-aligned endpoints */
export const usersProfileApi = {
  getProfile: () =>
    api.get<UserProfilePayload & { id: string; email: string }>('/users/me/profile'),

  putProfile: (data: UserProfilePayload) =>
    api.put<UserProfilePayload & { id: string; email: string }>('/users/me/profile', data),

  patchProfile: (data: Partial<UserProfilePayload>) =>
    api.patch<UserProfilePayload & { id: string; email: string }>('/users/me/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ ok: boolean }>('/users/me/password', {
      currentPassword,
      newPassword,
    }),

  getSavedCompanies: () =>
    api.get<SavedCompanyItem[] | { data?: SavedCompanyItem[] }>('/users/me/saved-companies'),

  addSavedCompany: (companyId: string) =>
    api.post<SavedCompanyItem>('/users/me/saved-companies', { company_id: companyId }),

  removeSavedCompany: (companyId: string) =>
    api.delete<{ ok: boolean }>(`/users/me/saved-companies/${companyId}`),

  getPreferences: () =>
    api.get<UserPreferencesPayload & { userId?: string }>('/users/me/preferences'),

  putPreferences: (data: UserPreferencesPayload) =>
    api.put<UserPreferencesPayload & { userId?: string }>('/users/me/preferences', data),

  getProvisionalWeightsPreview: (weights: ProvisionalWeightsPayload) =>
    api.get<ProvisionalWeightPreviewResult>(
      `/users/me/provisional-weights/preview?narrative=${weights.narrative}&credibility=${weights.credibility}&risk=${weights.risk}`
    ),

  commitProvisionalWeights: (weights: ProvisionalWeightsPayload) =>
    api.post<{ ok: boolean }>('/users/me/provisional-weights/commit', weights),

  initiateExport: () => api.post<ExportJob>('/users/me/export', {}),

  getExportStatus: (exportId: string) =>
    api.get<ExportJob>(`/exports/${exportId}`),

  deleteAccount: (password: string) =>
    api.post<{ ok: boolean }>('/users/me/delete', { password }),

  getAuditLogs: (range: 'recent' = 'recent') =>
    api.get<AuditLogItem[] | { data?: AuditLogItem[] }>(`/audit/logs?range=${range}`),
}

/** Normalize saved companies response - runtime safety */
export function normalizeSavedCompanies(
  res: SavedCompanyItem[] | { data?: SavedCompanyItem[] } | unknown
): SavedCompanyItem[] {
  if (Array.isArray(res)) return res
  const data = (res as { data?: unknown })?.data
  return Array.isArray(data) ? data : []
}
