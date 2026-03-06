import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDashboardApi, type AdminNotification } from '@/api/admin-dashboard'
import { adminApi } from '@/api/admin'
import type { SignEventsParams } from '@/types/admin'
import { toast } from 'sonner'

const INGESTION_KEY = ['admin', 'ingestion-status']
const SYSTEM_HEALTH_KEY = ['admin', 'system-health']
const ADMIN_ACTIONS_KEY = ['admin', 'admin-actions']
const PAYLOADS_KEY = ['admin', 'payloads']
const INGEST_MONITOR_KEY = ['admin', 'ingest-monitor']

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

export function usePayloads(params?: {
  page?: number
  limit?: number
  source?: string
  from?: string
  to?: string
}) {
  return useQuery({
    queryKey: [...PAYLOADS_KEY, params],
    queryFn: () => adminDashboardApi.getPayloads(params),
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
    mutationFn: (id: string) => adminDashboardApi.replayPayload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYLOADS_KEY })
      queryClient.invalidateQueries({ queryKey: INGESTION_KEY })
      toast.success('Payload replay initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Replay failed')
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
