/**
 * Admin User Management API
 * Uses /admin/users endpoints when available; falls back to /users for compatibility
 */
import { api } from '@/lib/api'
import { usersApi } from '@/api/users'
import type { User } from '@/types/user'
import type {
  AdminUser,
  AdminUsersParams,
  AdminUsersResponse,
  ActivityLog,
  AuditEntry,
  AuditExportParams,
} from '@/types/admin'

const ADMIN_BASE = '/admin/users'
const AUDITS_BASE = '/admin/audits/users'

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) {
      searchParams.set(k, String(v))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

function userToAdminUser(u: User): AdminUser {
  const roles = (u.role ? [u.role] : ['user']) as AdminUser['roles']
  const status: AdminUser['status'] = u.email_verified ? 'active' : 'pending_verification'
  return {
    id: u.id,
    username: u.full_name ?? u.email?.split('@')[0] ?? '—',
    email: u.email ?? '',
    roles,
    status,
    lastLogin: undefined,
    createdAt: u.created_at ?? '',
    updatedAt: u.updated_at ?? '',
    isVerified: u.email_verified ?? false,
    metadata: {},
  }
}

export const adminUsersApi = {
  getUsers: async (params?: AdminUsersParams): Promise<AdminUsersResponse> => {
    try {
      const qs = params ? buildQueryString(params as Record<string, string | number | undefined>) : ''
      const res = await api.get<AdminUsersResponse | AdminUser[]>(`${ADMIN_BASE}${qs}`)
      if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as AdminUsersResponse).data)) {
        return res as AdminUsersResponse
      }
      const list = Array.isArray(res) ? res : []
      return { data: list, count: list.length, page: 1, limit: list.length }
    } catch {
      const legacy = await usersApi.getAll({
        search: params?.search,
        role: params?.role,
      })
      const data = (legacy ?? []).map(userToAdminUser)
      return { data, count: data.length, page: 1, limit: data.length }
    }
  },

  getUserById: async (id: string): Promise<AdminUser | null> => {
    try {
      const res = await api.get<AdminUser>(`${ADMIN_BASE}/${id}`)
      return res ?? null
    } catch {
      try {
        const u = await usersApi.getById(id)
        return u ? userToAdminUser(u) : null
      } catch {
        return null
      }
    }
  },

  updateUser: async (id: string, payload: Partial<Pick<AdminUser, 'roles' | 'status'>>): Promise<AdminUser> =>
    api.put<AdminUser>(`${ADMIN_BASE}/${id}`, payload),

  disableUser: async (id: string, reason?: string): Promise<void> => {
    try {
      await api.post(`${ADMIN_BASE}/${id}/disable`, { reason })
    } catch {
      await usersApi.disable(id, reason)
    }
  },

  resendVerification: async (id: string): Promise<void> => {
    try {
      await api.post(`${ADMIN_BASE}/${id}/resend-verification`, {})
    } catch {
      await usersApi.resendVerification(id)
    }
  },

  resetPassword: async (id: string): Promise<void> =>
    api.post(`${ADMIN_BASE}/${id}/reset-password`, {}),

  importCsv: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${base}${ADMIN_BASE}/import`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) throw new Error(`Import failed: ${res.status}`)
    const json = (await res.json()) as { imported?: number; errors?: string[] }
    return {
      imported: json?.imported ?? 0,
      errors: Array.isArray(json?.errors) ? json.errors : [],
    }
  },

  exportCsv: async (params?: AdminUsersParams): Promise<Blob> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    try {
      const qs = params ? buildQueryString(params as Record<string, string | number | undefined>) : ''
      const res = await fetch(`${base}${ADMIN_BASE}/export${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Export failed: ${res.status}`)
      return res.blob()
    } catch {
      return usersApi.exportCsv()
    }
  },

  getActivityLogs: async (userId: string, limit = 20): Promise<ActivityLog[]> => {
    try {
      const res = await api.get<ActivityLog[] | { data: ActivityLog[] }>(
        `${AUDITS_BASE}?userId=${encodeURIComponent(userId)}&limit=${limit}`
      )
      if (Array.isArray(res)) return res
      const data = (res as { data?: ActivityLog[] })?.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  getAudits: async (params?: AuditExportParams): Promise<AuditEntry[]> => {
    try {
      const qs = params ? buildQueryString(params as Record<string, string | number | undefined>) : ''
      const res = await api.get<AuditEntry[] | { data: AuditEntry[] }>(`${AUDITS_BASE}${qs}`)
      if (Array.isArray(res)) return res
      const data = (res as { data?: AuditEntry[] })?.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  exportAudits: async (params?: AuditExportParams): Promise<Blob> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    try {
      const qs = params ? buildQueryString(params as Record<string, string | number | undefined>) : ''
      const res = await fetch(`${base}${AUDITS_BASE}/export${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Audit export failed: ${res.status}`)
      return res.blob()
    } catch {
      const audits = await adminUsersApi.getAudits(params)
      const json = JSON.stringify(audits, null, 2)
      return new Blob([json], { type: 'application/json' })
    }
  },
}
