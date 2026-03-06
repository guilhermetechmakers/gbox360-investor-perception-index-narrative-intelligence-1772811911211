/**
 * Email Notifications & System Alerts - React Query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emailApi } from '@/api/email'
import { toast } from 'sonner'

export const emailKeys = {
  templates: ['email', 'templates'] as const,
  metrics: ['email', 'metrics'] as const,
  queue: ['email', 'queue'] as const,
  logs: (params?: Record<string, unknown>) => ['email', 'logs', params] as const,
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: emailKeys.templates,
    queryFn: () => emailApi.getTemplates(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useEmailMetrics(refetchInterval?: number) {
  return useQuery({
    queryKey: emailKeys.metrics,
    queryFn: () => emailApi.getMetrics(),
    refetchInterval: refetchInterval ?? 60000,
    staleTime: 1000 * 60,
  })
}

export function useEmailQueue(refetchInterval?: number) {
  return useQuery({
    queryKey: emailKeys.queue,
    queryFn: () => emailApi.getQueue(),
    refetchInterval: refetchInterval ?? 30000,
    staleTime: 1000 * 30,
  })
}

export function useEmailLogs(params?: {
  from?: string
  to?: string
  templateId?: string
  userId?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: emailKeys.logs(params),
    queryFn: () => emailApi.getLogs(params),
    staleTime: 1000 * 60,
  })
}

export function usePublishTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { subject?: string; bodyHtml?: string; bodyText?: string }
    }) => emailApi.publishTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.templates })
      toast.success('Template updated')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update template')
    },
  })
}

export function useSendTestEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ templateId, to }: { templateId: string; to: string }) =>
      emailApi.sendTestEmail(templateId, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.queue })
      queryClient.invalidateQueries({ queryKey: emailKeys.metrics })
      toast.success('Test email sent')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to send test email')
    },
  })
}

export function useEmailOptOut() {
  return useMutation({
    mutationFn: ({ userId, templateId }: { userId: string; templateId?: string }) =>
      emailApi.optOut(userId, templateId),
    onSuccess: () => {
      toast.success('Opt-out recorded')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to opt out')
    },
  })
}
