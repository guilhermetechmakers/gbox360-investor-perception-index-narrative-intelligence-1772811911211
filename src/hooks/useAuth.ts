import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { usersApi } from '@/api/users'
import { toast } from 'sonner'
import type { SignInInput, SignUpInput } from '@/types/auth'

export const authKeys = {
  user: ['auth', 'user'] as const,
}

export function useCurrentUser() {
  const hasToken =
    typeof localStorage !== 'undefined' && !!localStorage.getItem('auth_token')
  return useQuery({
    queryKey: authKeys.user,
    queryFn: usersApi.getCurrent,
    retry: false,
    staleTime: 1000 * 60 * 10,
    enabled: hasToken,
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SignInInput) => authApi.signIn(input),
    onSuccess: (data) => {
      if (data.user)
        queryClient.setQueryData(authKeys.user, data.user)
      toast.success('Signed in successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Sign in failed')
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),
    onSuccess: () => {
      toast.success('Account created. Please check your email to verify.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Sign up failed')
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Signed out')
    },
    onError: (err: Error) => toast.error(err.message || 'Sign out failed'),
  })
}

export function useResetPasswordRequest() {
  return useMutation({
    mutationFn: (email: string) => authApi.resetPasswordRequest(email),
    onSuccess: () =>
      toast.success(
        "If this email is registered, you'll receive a password reset link shortly."
      ),
    onError: (err: Error) =>
      toast.error(err.message || 'Password reset request failed'),
  })
}

export function usePasswordResetTokenStatus(token: string | null) {
  return useQuery({
    queryKey: ['auth', 'password-reset-token-status', token ?? ''],
    queryFn: () => authApi.getPasswordResetTokenStatus(token!),
    enabled: !!token && token.length > 0,
    staleTime: 1000 * 60,
    retry: false,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => toast.success('Password updated. You can sign in now.'),
    onError: (err: Error) =>
      toast.error(err.message || 'Password reset failed'),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: (data) => {
      if (data.success) toast.success('Verification email sent')
      else toast.error(data.message)
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Resend verification failed'),
  })
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: ({
      newEmail,
      currentPassword,
    }: {
      newEmail: string
      currentPassword?: string
    }) => authApi.changeEmail(newEmail, currentPassword),
    onSuccess: (data) => {
      if (data.success) toast.success('Verification email sent to new address')
      else toast.error(data.message)
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Change email failed'),
  })
}

export function useVerificationStatus(enabled: boolean) {
  return useQuery({
    queryKey: ['auth', 'verification-status'],
    queryFn: () => authApi.getVerificationStatus(),
    staleTime: 1000 * 30,
    retry: false,
    enabled,
  })
}
