/**
 * React Query hooks for Narratives API (Credibility & Risk Signals)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { narrativesApi } from '@/api/narratives'
import { toast } from 'sonner'
import type { RecomputeSignalsRequest } from '@/types/signals'

export const narrativeKeys = {
  detail: (id: string) => ['narratives', 'detail', id] as const,
  list: (params: Record<string, unknown>) => ['narratives', 'list', params] as const,
}

export function useNarrative(id: string | null) {
  return useQuery({
    queryKey: narrativeKeys.detail(id ?? ''),
    queryFn: () => narrativesApi.getNarrative(id ?? ''),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useNarratives(params: {
  company_id?: string
  window_start?: string
  window_end?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: narrativeKeys.list(params),
    queryFn: () => narrativesApi.getNarratives(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function usePostNarrative() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: narrativesApi.postNarrative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['narratives'] })
      toast.success('Narrative ingested; signals computed')
    },
    onError: (err: Error) => toast.error(err?.message ?? 'Ingestion failed'),
  })
}

export function useSignalsRecompute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RecomputeSignalsRequest) => narrativesApi.postSignalsRecompute(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['narratives'] })
      queryClient.invalidateQueries({ queryKey: ['ipi'] })
      toast.success(`Re-score complete: ${data?.updated_count ?? 0} events updated`)
    },
    onError: (err: Error) => toast.error(err?.message ?? 'Re-score failed'),
  })
}
