import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { User, UpdateUserInput } from '@/types/user'

async function getCurrentFromSupabase(): Promise<User | null> {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, org, role, avatar_url, locale, timezone, created_at, updated_at')
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
    locale: (profile as { locale?: string })?.locale,
    timezone: (profile as { timezone?: string })?.timezone,
    email_verified: !!session.user.email_confirmed_at,
    created_at: profile?.created_at ?? session.user.created_at,
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  }
}

export const usersApi = {
  getCurrent: async (): Promise<User> => {
    try {
      return await api.get<User>('/users/me')
    } catch {
      const supabaseUser = await getCurrentFromSupabase()
      if (supabaseUser) return supabaseUser
      throw new Error('Not authenticated')
    }
  },

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
