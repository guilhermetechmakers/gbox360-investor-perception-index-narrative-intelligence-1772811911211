import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '@/api/admin-users'
import { toast } from 'sonner'
import type { AdminUsersParams } from '@/types/admin'

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (params?: AdminUsersParams) =>
    [...adminUserKeys.all, 'list', JSON.stringify(params ?? {})] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
  activity: (id: string) => [...adminUserKeys.all, 'activity', id] as const,
  audits: (params?: Record<string, unknown>) =>
    [...adminUserKeys.all, 'audits', JSON.stringify(params ?? {})] as const,
}

export function useAdminUsers(params?: AdminUsersParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => adminUsersApi.getUsers(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: adminUserKeys.detail(id ?? ''),
    queryFn: async () => {
      const u = await adminUsersApi.getUserById(id!)
      if (!u) throw new Error('User not found')
      return u
    },
    enabled: !!id,
  })
}

export function useAdminUserActivity(userId: string | null) {
  return useQuery({
    queryKey: adminUserKeys.activity(userId ?? ''),
    queryFn: () => adminUsersApi.getActivityLogs(userId!, 20),
    enabled: !!userId,
  })
}

export function useAdminUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { roles?: string[]; full_name?: string; status?: import('@/types/admin').UserStatus }
    }) => adminUsersApi.updateUser(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(adminUserKeys.detail(data.id), data)
      qc.invalidateQueries({ queryKey: adminUserKeys.all })
      toast.success('User updated')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  })
}

export function useAdminDisableUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminUsersApi.disableUser(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: adminUserKeys.detail(id) })
      qc.invalidateQueries({ queryKey: adminUserKeys.all })
      toast.success('User disabled')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Disable failed'),
  })
}

export function useAdminResendVerification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.resendVerification(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: adminUserKeys.detail(id) })
      qc.invalidateQueries({ queryKey: adminUserKeys.all })
      toast.success('Verification email sent')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Resend failed'),
  })
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.resetPassword(id),
    onSuccess: () => toast.success('Password reset initiated'),
    onError: (err: Error) => toast.error(err.message ?? 'Reset failed'),
  })
}

export function useAdminImportCsv() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => adminUsersApi.importCsv(file),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: adminUserKeys.all })
      const errs = (data?.errors ?? []) as string[]
      if (errs.length > 0) {
        toast.warning(`Imported ${data?.imported ?? 0}, ${errs.length} errors`)
      } else {
        toast.success(`Imported ${data?.imported ?? 0} users`)
      }
    },
    onError: (err: Error) => toast.error(err.message ?? 'Import failed'),
  })
}

export function useAdminExportCsv() {
  return useMutation({
    mutationFn: (params?: { search?: string; role?: string; status?: string }) =>
      adminUsersApi.exportCsv(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Export failed'),
  })
}

export function useAdminAudits(params?: { userId?: string; from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: adminUserKeys.audits(params),
    queryFn: () => adminUsersApi.getAudits(params),
    staleTime: 1000 * 60,
  })
}

export function useAdminExportAudits() {
  return useMutation({
    mutationFn: (params?: { userId?: string; from?: string; to?: string; limit?: number }) =>
      adminUsersApi.exportAudits(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Audit export downloaded')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Audit export failed'),
  })
}

export const useUpdateAdminUser = useAdminUpdateUser
export const useDisableAdminUser = useAdminDisableUser
export const useResendAdminVerification = useAdminResendVerification
