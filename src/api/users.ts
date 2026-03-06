import { api } from '@/lib/api'
import type { User, UpdateUserInput } from '@/types/user'

export const usersApi = {
  getCurrent: async (): Promise<User> => api.get<User>('/users/me'),

  updateProfile: async (updates: UpdateUserInput): Promise<User> =>
    api.put<User>(`/users/${updates.id}`, updates),

  getById: async (id: string): Promise<User> => api.get<User>(`/users/${id}`),

  getAll: async (params?: { search?: string; role?: string }): Promise<User[]> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('q', params.search)
    if (params?.role) searchParams.set('role', params.role)
    const qs = searchParams.toString()
    return api.get<User[]>(`/users${qs ? `?${qs}` : ''}`)
  },

  disable: async (id: string, reason?: string): Promise<void> =>
    api.post(`/users/${id}/disable`, { reason }),

  resendVerification: async (id: string): Promise<void> =>
    api.post(`/users/${id}/resend-verification`, {}),

  exportCsv: async (): Promise<Blob> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      'http://localhost:3000/api'
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${base}/users/export/csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Export failed: ${res.status}`)
    return res.blob()
  },
}
