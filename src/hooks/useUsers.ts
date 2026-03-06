import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { authKeys } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { UpdateUserInput, User } from '@/types/user'

export const userKeys = {
  all: ['users'] as const,
  list: (filters?: string) => [...userKeys.all, 'list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUsers(filters?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: userKeys.list(JSON.stringify(filters)),
    queryFn: () => usersApi.getAll(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: UpdateUserInput) => usersApi.updateProfile(updates),
    onSuccess: (data: User) => {
      queryClient.setQueryData(userKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.setQueryData(authKeys.user, (prev: unknown) =>
        prev && typeof prev === 'object' && data
          ? { ...(prev as object), ...data, full_name: data.full_name, org: data.org, role: data.role }
          : prev
      )
      toast.success('Profile updated')
    },
    onError: (err: Error) => toast.error(err.message || 'Update failed'),
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      usersApi.disable(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      toast.success('User disabled')
    },
    onError: (err: Error) => toast.error(err.message || 'Disable failed'),
  })
}

export function useResendUserVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.resendVerification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      toast.success('Verification email sent')
    },
    onError: (err: Error) => toast.error(err.message || 'Resend failed'),
  })
}
