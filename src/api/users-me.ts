/**
 * Users Me API - /api/users/me/* endpoints
 * Profile, preferences, saved companies, password, export, delete
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'
import type { UserPreferences } from '@/types/settings'
import type { Company } from '@/types/company'

async function getCurrentFromSupabase(): Promise<User | null> {
  if (!supabase) return null
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, org, role, avatar_url, created_at, updated_at')
    .eq('id', session.user.id)
    .single()
  const meta = session.user.user_metadata ?? {}
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    full_name: (profile?.full_name ?? meta.full_name ?? meta.name) as string | undefined,
    avatar_url: (profile?.avatar_url ?? meta.avatar_url) as string | undefined,
    role: (profile?.role ?? meta.role) as User['role'],
    org: profile?.org ?? meta.org,
    locale: (profile as { locale?: string })?.locale ?? meta.locale,
    timezone: (profile as { timezone?: string })?.timezone ?? meta.timezone ?? 'UTC',
    email_verified: !!session.user.email_confirmed_at,
    created_at: profile?.created_at ?? session.user.created_at,
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  }
}

export interface UserProfileUpdate {
  name?: string
  avatar_url?: string
  locale?: string
  timezone?: string
  org?: string
}

export interface ReAuthPayload {
  password: string
}

export const usersMeApi = {
  getProfile: async (): Promise<User> => {
    try {
      return await api.get<User>('/users/me/profile')
    } catch {
      const supabaseUser = await getCurrentFromSupabase()
      if (supabaseUser) return supabaseUser
      throw new Error('Not authenticated')
    }
  },

  updateProfile: async (updates: UserProfileUpdate): Promise<User> =>
    api.put<User>('/users/me/profile', updates),

  patchProfile: async (updates: Partial<UserProfileUpdate>): Promise<User> =>
    api.patch<User>('/users/me/profile', updates),

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    reAuth?: ReAuthPayload
  ): Promise<void> => {
    await api.post('/users/me/password', {
      currentPassword,
      newPassword,
      ...reAuth,
    })
  },

  getSavedCompanies: async (): Promise<Company[]> => {
    try {
      const data = await api.get<Company[] | { data?: Company[] }>('/users/me/saved-companies')
      const list = Array.isArray(data) ? data : (data as { data?: Company[] })?.data
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  },

  addSavedCompany: async (companyId: string): Promise<void> =>
    api.post('/users/me/saved-companies', { company_id: companyId }),

  removeSavedCompany: async (companyId: string): Promise<void> =>
    api.delete(`/users/me/saved-companies/${companyId}`),

  getPreferences: async (): Promise<UserPreferences | null> => {
    try {
      const res = await api.get<UserPreferences | null>('/users/me/preferences')
      return res ?? null
    } catch {
      return null
    }
  },

  updatePreferences: async (prefs: Partial<Omit<UserPreferences, 'userId'>>): Promise<UserPreferences | null> => {
    const res = await api.put<UserPreferences>('/users/me/preferences', prefs)
    return res ?? null
  },

  getProvisionalWeightsPreview: async (weights: {
    narrative: number
    credibility: number
    risk: number
  }): Promise<{ score: number; delta: number } | null> => {
    try {
      return await api.post<{ score: number; delta: number }>(
        '/users/me/provisional-weights/preview',
        { weights }
      )
    } catch {
      return null
    }
  },

  commitProvisionalWeights: async (weights: {
    narrative: number
    credibility: number
    risk: number
  }): Promise<void> =>
    api.post('/users/me/provisional-weights/commit', { weights }),

  triggerExport: async (): Promise<{ exportId: string; status: string } | Blob | null> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      'http://localhost:3000/api'
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    try {
      const res = await fetch(`${base}/users/me/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ format: 'zip' }),
      })
      if (!res.ok) throw new Error(`Export failed: ${res.status}`)
      const contentType = res.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return (await res.json()) as { exportId: string; status: string }
      }
      return res.blob()
    } catch {
      return null
    }
  },

  getExportStatus: async (exportId: string): Promise<{
    status: 'pending' | 'completed' | 'failed'
    artifact_url?: string
    createdAt?: string
  } | null> => {
    try {
      return await api.get<{
        status: 'pending' | 'completed' | 'failed'
        artifact_url?: string
        createdAt?: string
      }>(`/exports/${exportId}`)
    } catch {
      return null
    }
  },

  deleteAccount: async (password: string): Promise<boolean> => {
    try {
      await api.post('/users/me/delete', { password })
      return true
    } catch {
      return false
    }
  },
}
