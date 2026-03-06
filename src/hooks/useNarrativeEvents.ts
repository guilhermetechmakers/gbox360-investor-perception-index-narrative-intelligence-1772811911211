/**
 * React Query hooks for Canonical Narrative Events API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { narrativeEventsApi } from '@/api/narrative-events'
import type { NarrativeEventListParams, CanonicalNarrativeEventInsert } from '@/types/narrative-event-canonical'

export const NARRATIVE_EVENTS_KEYS = {
  all: ['narrative-events'] as const,
  list: (params?: NarrativeEventListParams) => [...NARRATIVE_EVENTS_KEYS.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...NARRATIVE_EVENTS_KEYS.all, 'detail', id] as const,
  replayStatus: () => [...NARRATIVE_EVENTS_KEYS.all, 'replay-status'] as const,
}

export function useNarrativeEventsList(params?: NarrativeEventListParams) {
  return useQuery({
    queryKey: NARRATIVE_EVENTS_KEYS.list(params),
    queryFn: () => narrativeEventsApi.list(params),
    placeholderData: { items: [], total: 0 },
  })
}

export function useNarrativeEventDetail(eventId: string | null) {
  return useQuery({
    queryKey: NARRATIVE_EVENTS_KEYS.detail(eventId ?? ''),
    queryFn: () => (eventId ? narrativeEventsApi.get(eventId) : null),
    enabled: !!eventId,
  })
}

export function useNarrativeEventIngest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CanonicalNarrativeEventInsert) => narrativeEventsApi.ingest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NARRATIVE_EVENTS_KEYS.all })
    },
  })
}

export function useNarrativeEventReplay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => narrativeEventsApi.triggerReplay(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NARRATIVE_EVENTS_KEYS.replayStatus() })
      qc.invalidateQueries({ queryKey: NARRATIVE_EVENTS_KEYS.all })
    },
  })
}

export function useNarrativeEventReplayStatus() {
  return useQuery({
    queryKey: NARRATIVE_EVENTS_KEYS.replayStatus(),
    queryFn: () => narrativeEventsApi.getReplayStatus(),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' ? 2000 : false
    },
  })
}
