/**
 * Avatar upload utility - tries API first, then Supabase storage
 */
import { supabase } from '@/lib/supabase'

const base =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000/api'

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const { supabase: sb } = await import('@/lib/supabase')
    if (sb) {
      const { data } = await sb.auth.getSession()
      return data.session?.access_token ?? null
    }
  } catch {
    // ignore
  }
  return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
}

/** Upload avatar via API or Supabase storage; returns public URL or null */
export async function uploadAvatar(file: File): Promise<string | null> {
  const token = await getAuthToken()

  // Try API endpoint first
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await fetch(`${base}/users/me/profile/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (res.ok) {
      const data = (await res.json()) as { url?: string; avatar_url?: string }
      return data?.url ?? data?.avatar_url ?? null
    }
  } catch {
    // Fall through to Supabase
  }

  // Try Supabase storage
  if (supabase) {
    try {
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id
      if (!userId) return null

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (error) return null

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data?.publicUrl ?? null
    } catch {
      return null
    }
  }

  return null
}
