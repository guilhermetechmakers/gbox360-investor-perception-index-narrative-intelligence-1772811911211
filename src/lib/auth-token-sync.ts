/**
 * Syncs Supabase session access_token to localStorage for API compatibility.
 * api.ts and other consumers read auth_token from localStorage.
 */
import { supabase } from '@/lib/supabase'

const AUTH_TOKEN_KEY = 'auth_token'

export function syncAuthTokenFromSession(): void {
  if (typeof localStorage === 'undefined') return
  if (!supabase) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }
  supabase.auth.getSession().then(({ data }) => {
    const token = data.session?.access_token ?? null
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  })
}

export function clearAuthToken(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}
