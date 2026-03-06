import { api } from '@/lib/api'
import type { AuthResponse, SignInInput, SignUpInput } from '@/types/auth'

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

  resendVerification: async (): Promise<void> =>
    api.post('/auth/resend-verification', {}),

  changeEmail: async (newEmail: string): Promise<void> =>
    api.post('/auth/change-email', { new_email: newEmail }),
}
