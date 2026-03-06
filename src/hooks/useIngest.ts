import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestApi } from '@/api/ingest'
import { toast } from 'sonner'

const METRICS_KEY = ['ingest', 'metrics']
const ERRORS_KEY = ['ingest', 'errors']
const HEALTH_KEY = ['ingest', 'health']
const DLQ_KEY = ['ingest', 'dlq']

export function useIngestMetrics(refetchInterval?: number) {
  return useQuery({
    queryKey: METRICS_KEY,
    queryFn: async () => {
      const res = await ingestApi.getMetrics()
      const data = Array.isArray(res?.data) ? res.data : []
      return { data, count: res?.count ?? data.length }
    },
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useIngestErrors(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...ERRORS_KEY, params?.page ?? 1, params?.limit ?? 20],
    queryFn: async () => {
      const res = await ingestApi.getErrors(params)
      const data = Array.isArray(res?.data) ? res.data : []
      return { data, nextPage: res?.nextPage }
    },
  })
}

export function useIngestHealth(refetchInterval?: number) {
  return useQuery({
    queryKey: HEALTH_KEY,
    queryFn: async () => {
      const res = await ingestApi.getHealth()
      const components = Array.isArray(res?.components) ? res.components : []
      return { components }
    },
    refetchInterval: refetchInterval ?? 30000,
  })
}

export function useDLQ() {
  return useQuery({
    queryKey: DLQ_KEY,
    queryFn: async () => {
      const res = await ingestApi.getDLQ()
      const data = Array.isArray(res?.data) ? res.data : []
      return { data }
    },
  })
}

export function useIngestReplay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { sourceId?: string; batchId?: string; idempotencyKey: string }) =>
      ingestApi.triggerReplay(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: METRICS_KEY })
      queryClient.invalidateQueries({ queryKey: ERRORS_KEY })
      queryClient.invalidateQueries({ queryKey: DLQ_KEY })
      toast.success(data?.message ?? 'Replay initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Replay failed')
    },
  })
}

export function useDLQRetry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      ingestApi.retryDLQ(id, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DLQ_KEY })
      queryClient.invalidateQueries({ queryKey: METRICS_KEY })
      toast.success('DLQ retry initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'DLQ retry failed')
    },
  })
}

export function useDLQPurge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      ingestApi.purgeDLQ(id, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DLQ_KEY })
      toast.success('DLQ entry purged')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'DLQ purge failed')
    },
  })
}

export function useTriggerBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idempotencyKey: string) => ingestApi.triggerBatch(idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: METRICS_KEY })
      queryClient.invalidateQueries({ queryKey: ERRORS_KEY })
      toast.success('Batch import triggered')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Batch trigger failed')
    },
  })
}

export function useErrorRetry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (errorId: string) =>
      ingestApi.retryError(errorId, `retry-${errorId}-${Date.now()}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ERRORS_KEY })
      queryClient.invalidateQueries({ queryKey: METRICS_KEY })
      toast.success('Retry initiated')
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Retry failed')
    },
  })
}
