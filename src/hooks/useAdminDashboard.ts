import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDashboardApi, type AdminNotification } from '@/api/admin-dashboard'
import { adminApi } from '@/api/admin'
import type {
  SignEventsParams,
  PayloadSearchFilters,
  GenerateAuditExportParams,
  AuditLogsParams,
} from '@/types/admin'
import { toast } from 'sonner'

const INGESTION_KEY = ['admin', 'ingestion-status']
const SYSTEM_HEALTH_KEY = ['admin', 'system-health']
const ADMIN_ACTIONS_KEY = ['admin', 'admin-actions']
const PAYLOADS_KEY = ['admin', 'payloads']
const PAYLOAD_DETAIL_KEY = ['admin', 'payload-detail']
const INGEST_MONITOR_KEY = ['admin', 'ingest-monitor']
const HEALTH_KEY = ['admin', 'health']
const INGEST_STATUS_KEY = ['admin', 'ingest-status']
const AUDIT_LOGS_KEY = ['admin', 'audit-logs']

export function useAdminHealth(refetchInterval?: number) {
  return useQuery({
    queryKey: HEALTH_KEY,
    queryFn: () => adminDashboardApi.getHealth(),
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useAdminIngestStatus(refetchInterval?: number) {
  return useQuery({
    queryKey: INGEST_STATUS_KEY,
    queryFn: () => adminDashboardApi.getIngestStatus(),
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useAuditLogs(params?: AuditLogsParams) {
  return useQuery({
    queryKey: [...AUDIT_LOGS_KEY, params],
    queryFn: () => adminDashboardApi.getAuditLogs(params),
  })
}

export function useIngestionStatus(refetchInterval?: number) {
  return useQuery({
    queryKey: INGESTION_KEY,
    queryFn: () => adminDashboardApi.getIngestionStatus(),
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useSystemHealth(refetchInterval?: number) {
  return useQuery({
    queryKey: SYSTEM_HEALTH_KEY,
    queryFn: () => adminDashboardApi.getSystemHealth(),
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useAdminActions(params?: { limit?: number }) {
  const limit = params?.limit ?? 20
  return useQuery({
    queryKey: [...ADMIN_ACTIONS_KEY, limit],
    queryFn: () => adminDashboardApi.getAdminActions({ limit }),
  })
}

export function usePayloads(params?: PayloadSearchFilters) {
  return useQuery({
    queryKey: [...PAYLOADS_KEY, params],
    queryFn: () => adminDashboardApi.getPayloads(params),
  })
}

export function usePayloadDetail(id: string | null) {
  return useQuery({
    queryKey: [...PAYLOAD_DETAIL_KEY, id],
    queryFn: () => (id ? adminDashboardApi.getPayloadDetail(id) : Promise.reject(new Error('No id'))),
    enabled: !!id,
  })
}

export function useIngestMonitor(refetchInterval?: number) {
  return useQuery({
    queryKey: INGEST_MONITOR_KEY,
    queryFn: () => adminDashboardApi.getIngestMonitor(),
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useReplayPayload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      id: string
      idempotencyKey?: string
      reason?: string
    }) =>
      adminDashboardApi.replayPayload(params.id, {
        idempotencyKey: params.idempotencyKey,
        reason: params.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYLOADS_KEY })
      queryClient.invalidateQueries({ queryKey: PAYLOAD_DETAIL_KEY })
      queryClient.invalidateQueries({ queryKey: INGESTION_KEY })
      toast.success('Payload replay initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Replay failed')
    },
  })
}

export function useReplayPayloadsBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      payloadIds: string[]
      idempotencyKey?: string
      reason?: string
    }) =>
      adminDashboardApi.replayPayloadsBatch(params.payloadIds, {
        idempotencyKey: params.idempotencyKey,
        reason: params.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYLOADS_KEY })
      queryClient.invalidateQueries({ queryKey: PAYLOAD_DETAIL_KEY })
      queryClient.invalidateQueries({ queryKey: INGESTION_KEY })
      toast.success('Batch replay initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Batch replay failed')
    },
  })
}

export function useSetPayloadRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, retain }: { id: string; retain: boolean }) =>
      adminDashboardApi.setPayloadRetention(id, retain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYLOADS_KEY })
      queryClient.invalidateQueries({ queryKey: PAYLOAD_DETAIL_KEY })
      toast.success('Retention updated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Retention update failed')
    },
  })
}

export function usePurgePayload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDashboardApi.purgePayload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYLOADS_KEY })
      queryClient.invalidateQueries({ queryKey: PAYLOAD_DETAIL_KEY })
      toast.success('Payload purged')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Purge failed')
    },
  })
}

export function useGenerateAuditExport() {
  return useMutation({
    mutationFn: (params: GenerateAuditExportParams) => adminDashboardApi.generateAuditExport(params),
    onSuccess: () => {
      toast.success('Audit export generated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Export generation failed')
    },
  })
}

export function useSignEvents() {
  return useMutation({
    mutationFn: (params: SignEventsParams) => adminDashboardApi.signEvents(params),
  })
}

export function useUserSummary() {
  const { data } = useQuery({
    queryKey: ['admin', 'users', 'summary'],
    queryFn: async () => {
      const res = await adminApi.getUsers({ limit: 1000 })
      const users = res?.data ?? []
      const active = users.filter((u) => u.status === 'active').length
      const disabled = users.filter((u) => u.status === 'disabled').length
      return {
        total: users.length,
        active,
        disabled,
        recentVerifications: 0,
      }
    },
  })
  return data ?? { total: 0, active: 0, disabled: 0, recentVerifications: 0 }
}

/** Alias exports for Admin Dashboard components */
export const useAdminIngestionStatus = useIngestionStatus
export const useAdminSystemHealth = useSystemHealth
export const useAdminIngestMonitor = useIngestMonitor
export const useAdminReplayPayload = useReplayPayload
export const useAdminSignEvents = useSignEvents

/** Mock notifications for admin UI - replace with API when available */
export function useAdminNotifications(): {
  notifications: AdminNotification[]
  dismiss: (id: string) => void
  acknowledge: (id: string) => void
} {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])
  const acknowledge = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
    )
  }, [])
  return { notifications, dismiss, acknowledge }
}
