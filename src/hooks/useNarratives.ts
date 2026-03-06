/**
 * React Query hooks for Narratives API (Topic Classification & Narrative Persistence)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { narrativesApi } from '@/api/narratives'
import type { NarrativesListParams, NarrativeIngestPayload } from '@/types/topic-classification'

export const narrativesKeys = {
  all: ['narratives'] as const,
  list: (params?: NarrativesListParams) => [...narrativesKeys.all, 'list', params] as const,
  detail: (id: string) => [...narrativesKeys.all, 'detail', id] as const,
}

export function useNarratives(params?: NarrativesListParams) {
  return useQuery({
    queryKey: narrativesKeys.list(params),
    queryFn: () => narrativesApi.list(params),
    enabled: true,
  })
}

export function useNarrative(id: string | null) {
  return useQuery({
    queryKey: narrativesKeys.detail(id ?? ''),
    queryFn: () => (id ? narrativesApi.get(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useIngestNarrative() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: NarrativeIngestPayload) =>
      narrativesApi.ingest(payload as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: narrativesKeys.all })
    },
  })
}
