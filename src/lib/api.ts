const base =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000/api'

/** Get auth token: prefer Supabase session, fallback to localStorage */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const { supabase } = await import('@/lib/supabase')
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      return data.session?.access_token ?? null
    }
  } catch {
    // Supabase may not be configured
  }
  return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${base}${endpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = await getAuthToken()
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    let message = `API Error: ${res.status}`
    try {
      const body = (await res.json()) as { message?: string; error?: string; msg?: string }
      const errMsg = body?.message ?? body?.error ?? body?.msg
      if (typeof errMsg === 'string' && errMsg.trim()) message = errMsg
    } catch {
      // Response body may not be JSON
    }
    if (res.status === 401) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      try {
        const { supabase } = await import('@/lib/supabase')
        if (supabase) await supabase.auth.signOut()
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
}

export type ApiError = Error & { status?: number; code?: string }
