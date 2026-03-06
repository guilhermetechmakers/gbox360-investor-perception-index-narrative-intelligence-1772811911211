/**
 * React Query hooks for transcript batch ingestion
 */
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestApi } from '@/api/ingest'
import { toast } from 'sonner'
import type { TranscriptBatchRequest, TranscriptBatchStatus } from '@/types/ingest'

const BATCH_STATUS_KEY = ['ingest', 'transcript-batch-status']
const DLQ_KEY = ['ingest', 'dlq']

export function useTranscriptBatchSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: TranscriptBatchRequest) => ingestApi.submitTranscriptBatch(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BATCH_STATUS_KEY })
      queryClient.invalidateQueries({ queryKey: DLQ_KEY })
      toast.success(`Batch ${data?.batch_id ?? 'submitted'} started`)
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Batch submit failed')
    },
  })
}

export function useTranscriptBatchStatus(batchId: string | null) {
  return useQuery({
    queryKey: [...BATCH_STATUS_KEY, batchId ?? ''],
    queryFn: async (): Promise<TranscriptBatchStatus | null> => {
      if (!batchId?.trim()) return null
      const res = await ingestApi.getTranscriptBatchStatus(batchId)
      return res ?? null
    },
    enabled: !!batchId?.trim(),
    refetchInterval: (query) => {
      const status = (query.state.data as TranscriptBatchStatus | null)?.status
      if (status === 'in_progress' || status === 'pending') return 5000
      return false
    },
  })
}

export function useTranscriptBatchStatusRefetch(batchId: string | null) {
  const queryClient = useQueryClient()
  return useCallback(() => {
    if (batchId?.trim()) {
      queryClient.invalidateQueries({ queryKey: [...BATCH_STATUS_KEY, batchId] })
    }
  }, [queryClient, batchId])
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

export function useDLQRetry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      ingestApi.retryDLQ(id, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DLQ_KEY })
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
