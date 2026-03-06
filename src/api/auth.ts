import { api } from '@/lib/api'
import type {
  AuthResponse,
  SignInInput,
  SignUpInput,
  VerificationStatusResponse,
  ResendVerificationResponse,
  ChangeEmailResponse,
  PasswordResetTokenStatusResponse,
} from '@/types/auth'

export const authApi = {
  signIn: async (credentials: SignInInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/login', credentials)
    if (data.token && typeof localStorage !== 'undefined')
      localStorage.setItem('auth_token', data.token)
    return data
  },

  signUp: async (credentials: SignUpInput): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/register', credentials)
    if (data.token && typeof localStorage !== 'undefined')
      localStorage.setItem('auth_token', data.token)
    return data
  },

  signOut: async (): Promise<void> => {
    await api.post('/auth/logout', {})
    if (typeof localStorage !== 'undefined') localStorage.removeItem('auth_token')
  },

  resetPasswordRequest: async (email: string): Promise<void> =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: async (token: string, newPassword: string): Promise<void> =>
    api.post('/auth/reset-password', { token, password: newPassword }),

  getPasswordResetTokenStatus: async (
    token: string
  ): Promise<PasswordResetTokenStatusResponse | null> => {
    try {
      const res = await api.get<PasswordResetTokenStatusResponse>(
        `/auth/password-reset-token-status?token=${encodeURIComponent(token)}`
      )
      return {
        valid: res?.valid ?? false,
        expiresAt: res?.expiresAt,
        reason: res?.reason,
      }
    } catch {
      return null
    }
  },

  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    const res = await api.get<VerificationStatusResponse>('/auth/verification-status')
    return {
      status: res?.status ?? 'unknown',
      lastSentAt: res?.lastSentAt ?? null,
      attempts: res?.attempts ?? 0,
      email: res?.email ?? undefined,
    }
  },

  resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
    const res = await api.post<ResendVerificationResponse>('/auth/resend-verification', {
      email,
    })
    return {
      success: res?.success ?? false,
      message: res?.message ?? '',
      nextAllowedAt: res?.nextAllowedAt,
    }
  },

  changeEmail: async (
    newEmail: string,
    currentPassword?: string
  ): Promise<ChangeEmailResponse> => {
    const res = await api.post<ChangeEmailResponse>('/auth/change-email', {
      newEmail,
      currentPassword: currentPassword ?? undefined,
    })
    return {
      success: res?.success ?? false,
      message: res?.message ?? '',
    }
  },
}
