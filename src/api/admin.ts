/**
 * Admin API - User Management, Audit Export
 * Endpoints: /admin/users, /admin/audits/users
 */
import { api } from '@/lib/api'
import type {
  AdminUser,
  AdminUsersParams,
  AdminUsersResponse,
  ActivityLog,
  AuditEntry,
  AuditExportParams,
} from '@/types/admin'
import { toAdminUser } from '@/types/admin'

const ADMIN_BASE = '/admin/users'
const AUDIT_BASE = '/admin/audits/users'

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') searchParams.set(k, String(v))
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const adminApi = {
  getUsers: async (params?: AdminUsersParams): Promise<AdminUsersResponse> => {
    const qs = buildQueryString({
      search: params?.search,
      role: params?.role,
      status: params?.status,
      sort: params?.sort,
      page: params?.page,
      limit: params?.limit,
    })
    try {
      const res = await api.get<AdminUsersResponse | AdminUser[]>(`${ADMIN_BASE}${qs}`)
      if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as AdminUsersResponse).data)) {
        return res as AdminUsersResponse
      }
      const list = Array.isArray(res) ? res : (res as { data?: AdminUser[] })?.data ?? []
      return { data: list, count: list.length, page: 1, limit: list.length }
    } catch {
      const sp = new URLSearchParams()
      if (params?.search) sp.set('q', params.search)
      if (params?.role) sp.set('role', params.role)
      const fallbackQs = sp.toString() ? `?${sp.toString()}` : ''
      const fallback = await api.get<AdminUser[] | { data?: AdminUser[] }>(`/users${fallbackQs}`)
      const list = Array.isArray(fallback) ? fallback : (fallback?.data ?? [])
      const normalized = (list ?? []).map((u) =>
        'username' in u ? (u as AdminUser) : toAdminUser(u as Parameters<typeof toAdminUser>[0])
      )
      return { data: normalized, count: normalized.length, page: 1, limit: normalized.length }
    }
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    try {
      const res = await api.get<AdminUser>(`${ADMIN_BASE}/${id}`)
      if (res && 'username' in res) return res as AdminUser
      return toAdminUser(res as Parameters<typeof toAdminUser>[0])
    } catch {
      const fallback = await api.get<Parameters<typeof toAdminUser>[0]>(`/users/${id}`)
      return toAdminUser(fallback)
    }
  },

  updateUser: async (id: string, payload: { roles?: string[]; full_name?: string }): Promise<AdminUser> => {
    const res = await api.put<AdminUser | Parameters<typeof toAdminUser>[0]>(`${ADMIN_BASE}/${id}`, payload)
    if (res && 'username' in res) return res as AdminUser
    return toAdminUser(res as Parameters<typeof toAdminUser>[0])
  },

  disableUser: async (id: string, reason?: string): Promise<void> => {
    try {
      await api.post(`${ADMIN_BASE}/${id}/disable`, { reason })
    } catch {
      await api.post(`/users/${id}/disable`, { reason })
    }
  },

  resendVerification: async (id: string): Promise<void> => {
    try {
      await api.post(`${ADMIN_BASE}/${id}/resend-verification`, {})
    } catch {
      await api.post(`/users/${id}/resend-verification`, {})
    }
  },

  resetPassword: async (id: string): Promise<void> => {
    await api.post(`${ADMIN_BASE}/${id}/reset-password`, {})
  },

  importCsv: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${base}/admin/users/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) throw new Error(`Import failed: ${res.status}`)
    return res.json()
  },

  exportCsv: async (params?: { search?: string; role?: string; status?: string }): Promise<Blob> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    const qs = buildQueryString(params ?? {})
    const res = await fetch(`${base}/admin/users/export${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const fallback = await fetch(`${base}/users/export/csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!fallback.ok) throw new Error(`Export failed: ${res.status}`)
      return fallback.blob()
    }
    return res.blob()
  },

  getAudits: async (params?: AuditExportParams): Promise<AuditEntry[]> => {
    const qs = buildQueryString(
      (params
        ? {
            userId: params.userId,
            from: params.from,
            to: params.to,
            limit: params.limit,
          }
        : {}) as Record<string, string | number | undefined>
    )
    const res = await api.get<AuditEntry[] | { data?: AuditEntry[] }>(`${AUDIT_BASE}${qs}`)
    const list = Array.isArray(res) ? res : (res?.data ?? [])
    return list ?? []
  },

  getActivityLog: async (userId: string, limit = 20): Promise<ActivityLog[]> => {
    try {
      const res = await api.get<ActivityLog[] | { data?: ActivityLog[] }>(
        `${ADMIN_BASE}/${userId}/activity?limit=${limit}`
      )
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      return list ?? []
    } catch {
      return []
    }
  },

  exportAudits: async (params?: AuditExportParams): Promise<Blob> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    const qs = buildQueryString((params ?? {}) as Record<string, string | number | undefined>)
    const res = await fetch(`${base}/admin/audits/users/export${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Audit export failed: ${res.status}`)
    return res.blob()
  },
}
