import { supabase } from '@/lib/supabase'
import { syncAuthTokenFromSession, clearAuthToken } from '@/lib/auth-token-sync'
import { api } from '@/lib/api'
import { emailApi } from '@/api/email'
import type {
  AuthResponse,
  SignInInput,
  SignUpInput,
  DemoAuthResponse,
  VerificationStatusResponse,
  ResendVerificationResponse,
  ChangeEmailResponse,
  PasswordResetTokenStatusResponse,
} from '@/types/auth'

function mapSupabaseUser(data: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null }) {
  const u = data?.user
  if (!u) return undefined
  return {
    id: u.id,
    email: u.email ?? '',
    full_name: (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string),
    role: u.user_metadata?.role as string | undefined,
  }
}

export const authApi = {
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
      if (error) throw error
      const token = data.session?.access_token ?? null
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }
      return {
        token,
        user: mapSupabaseUser({ user: data.user }),
      }
    }
    const data = await api.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.remember,
    })
    const token = data?.token ?? null
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
    return data ?? {}
  },

  demoSignIn: async (): Promise<DemoAuthResponse> => {
    if (supabase) {
      const demoEmail = import.meta.env.VITE_DEMO_EMAIL ?? 'demo@gbox360.local'
      const demoPassword = import.meta.env.VITE_DEMO_PASSWORD ?? 'Demo123!@#'
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (error) throw error
      const token = data.session?.access_token ?? null
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }
      return {
        token,
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email ?? '',
              name: (data.user.user_metadata?.full_name as string) ?? (data.user.user_metadata?.name as string),
            }
          : undefined,
        limitations: ['Read-only access', 'Demo data only'],
      }
    }
    const data = await api.post<DemoAuthResponse>('/auth/demo-signin', {})
    const token = data?.token ?? null
    if (token && typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
    return {
      token: data?.token,
      user: data?.user ? { id: data.user.id, email: data.user.email, name: data.user.name } : undefined,
      limitations: data?.limitations,
    }
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
            org: credentials.org,
            role: credentials.role,
            invite_code: credentials.invite_code,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      const token = data.session?.access_token ?? null
      const requiresEmailVerification = !!data.user && !data.session
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }
      syncAuthTokenFromSession()
      return {
        token: token ?? undefined,
        user: mapSupabaseUser({ user: data.user }),
        requiresEmailVerification,
      }
    }
    const data = await api.post<AuthResponse>('/auth/register', credentials)
    if (data?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', data.token)
    }
    return data ?? {}
  },

  signOut: async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      await api.post('/auth/logout', {})
    }
    clearAuthToken()
  },

  resetPasswordRequest: async (email: string): Promise<void> => {
    if (supabase) {
      const redirectTo = `${window.location.origin}/reset`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      return
    }
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return
    }
    await api.post('/auth/reset-password', { token, password: newPassword })
  },

  getPasswordResetTokenStatus: async (
    token: string
  ): Promise<PasswordResetTokenStatusResponse | null> => {
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          return {
            valid: true,
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
          }
        }
        return { valid: false, reason: 'No active session' }
      } catch {
        return null
      }
    }
    try {
      const res = await api.get<PasswordResetTokenStatusResponse>(
        `/auth/password-reset-token-status?token=${encodeURIComponent(token)}`
      )
      return { valid: res?.valid ?? false, expiresAt: res?.expiresAt, reason: res?.reason }
    } catch {
      return null
    }
  },

  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    if (!supabase) {
      try {
        const res = await api.get<VerificationStatusResponse>('/auth/verification-status')
        return {
          status: res?.status ?? 'unknown',
          lastSentAt: res?.lastSentAt ?? null,
          attempts: res?.attempts ?? 0,
          email: res?.email ?? undefined,
        }
      } catch {
        return { status: 'unknown' }
      }
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { status: 'unknown' }
      try {
        const res = await supabase.functions.invoke('verification-status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const body = (res?.data ?? {}) as Record<string, unknown>
        return {
          status: (body.status as VerificationStatusResponse['status']) ?? 'unknown',
          lastSentAt: (body.lastSentAt as string | null) ?? null,
          attempts: (body.attempts as number) ?? 0,
          email: body.email as string | undefined,
        }
      } catch {
        return {
          status: session.user.email_confirmed_at ? 'delivered' : 'pending',
          email: session.user.email ?? undefined,
        }
      }
    } catch {
      return { status: 'unknown' }
    }
  },

  resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
    try {
      const res = await emailApi.resendVerification(email)
      return {
        success: res?.success ?? false,
        message: res?.message ?? '',
        nextAllowedAt: res?.nextAllowedAt,
      }
    } catch {
      if (supabase) {
        try {
          const { error } = await supabase.auth.resend({ type: 'signup', email })
          if (error) throw error
          return { success: true, message: 'Verification email sent' }
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Failed to resend',
          }
        }
      }
      try {
        const res = await api.post<ResendVerificationResponse>('/auth/resend-verification', { email })
        return {
          success: res?.success ?? false,
          message: res?.message ?? '',
          nextAllowedAt: res?.nextAllowedAt,
        }
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Failed to resend',
        }
      }
    }
  },

  changeEmail: async (
    newEmail: string,
    currentPassword?: string
  ): Promise<ChangeEmailResponse> => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          email: newEmail,
          ...(currentPassword && { password: currentPassword }),
        })
        if (error) {
          return { success: false, message: error.message }
        }
        return { success: true, message: 'Verification email sent to new address' }
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Failed to update email',
        }
      }
    }
    try {
      const res = await api.post<ChangeEmailResponse>('/auth/change-email', {
        newEmail,
        currentPassword: currentPassword ?? undefined,
      })
      return {
        success: res?.success ?? false,
        message: res?.message ?? '',
      }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to update email',
      }
    }
  },
}
