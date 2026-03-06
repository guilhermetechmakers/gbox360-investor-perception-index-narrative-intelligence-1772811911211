import { useMemo } from 'react'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { ipiApi } from '@/api/ipi'
import { exportApi } from '@/api/export'
import { toast } from 'sonner'
import type { NarrativeEvent } from '@/types/narrative'

export const ipiKeys = {
  movement: (narrativeId: string, companyId?: string, start?: string, end?: string) =>
    ['ipi', 'movement', narrativeId, companyId, start, end] as const,
  snapshot: (companyId: string, start: string, end: string) =>
    ['ipi', 'snapshot', companyId, start, end] as const,
  dashboard: (companyIds: string[], start: string, end: string) =>
    ['ipi', 'dashboard', companyIds.join(','), start, end] as const,
  provenance: (provenanceId: string) => ['ipi', 'provenance', provenanceId] as const,
  narrativeEvents: (
    narrativeId: string,
    page: number,
    limit: number,
    filters?: Record<string, string | number>
  ) => ['ipi', 'events', narrativeId, page, limit, filters] as const,
  rawPayload: (id: string) => ['ipi', 'raw-payload', id] as const,
}

export function useMovement(
  narrativeId: string,
  companyId?: string,
  windowStart?: string,
  windowEnd?: string
) {
  return useQuery({
    queryKey: ipiKeys.movement(narrativeId, companyId, windowStart, windowEnd),
    queryFn: () =>
      ipiApi.getMovement(narrativeId, companyId, windowStart, windowEnd),
    enabled: !!narrativeId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useIPISnapshot(
  companyId: string,
  windowStart: string,
  windowEnd: string
) {
  return useQuery({
    queryKey: ipiKeys.snapshot(companyId, windowStart, windowEnd),
    queryFn: () =>
      ipiApi.getSnapshot(companyId, windowStart, windowEnd),
    enabled: !!companyId && !!windowStart && !!windowEnd,
    staleTime: 1000 * 60 * 2,
  })
}

export function useDashboardCards(
  companyIds: string[],
  windowStart: string,
  windowEnd: string
) {
  return useQuery({
    queryKey: ipiKeys.dashboard(companyIds, windowStart, windowEnd),
    queryFn: () =>
      ipiApi.getDashboardCards(companyIds, windowStart, windowEnd),
    enabled:
      companyIds.length > 0 && !!windowStart && !!windowEnd,
    staleTime: 1000 * 60 * 2,
  })
}

export function useNarrativeEvents(
  narrativeId: string,
  page: number,
  limit: number,
  filters?: {
    source?: string
    authority_min?: number
    date_start?: string
    date_end?: string
    sort?: 'asc' | 'desc'
    sortBy?: 'timestamp' | 'source' | 'authority'
  }
) {
  return useQuery({
    queryKey: ipiKeys.narrativeEvents(
      narrativeId,
      page,
      limit,
      filters as Record<string, string | number> | undefined
    ),
    queryFn: () =>
      ipiApi.getNarrativeEvents(narrativeId, page, limit, filters),
    enabled: !!narrativeId,
  })
}

export function useRawPayload(rawPayloadId: string) {
  return useQuery({
    queryKey: ipiKeys.rawPayload(rawPayloadId),
    queryFn: () => ipiApi.getRawPayload(rawPayloadId),
    enabled: !!rawPayloadId,
  })
}

export function useProvenance(provenanceId: string) {
  return useQuery({
    queryKey: ipiKeys.provenance(provenanceId),
    queryFn: () => ipiApi.getProvenance(provenanceId),
    enabled: !!provenanceId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCalculateIPI() {
  const queryClient = useQueryClient()
  type Variables = { companyId: string; windowStart: string; windowEnd: string; topN?: number }
  type Context = { toastId: string | number }
  return useMutation<Awaited<ReturnType<typeof ipiApi.calculate>>, Error, Variables, Context>({
    mutationFn: (params: Variables) => ipiApi.calculate(params),
    onMutate: () => {
      const toastId = toast.loading('Calculating IPI…')
      return { toastId }
    },
    onSuccess: (_data, variables, context) => {
      const ctx = (context as unknown) as Context | undefined
      if (ctx?.toastId) toast.dismiss(ctx.toastId)
      queryClient.invalidateQueries({
        queryKey: ipiKeys.snapshot(variables.companyId, variables.windowStart, variables.windowEnd),
      })
      queryClient.invalidateQueries({ queryKey: ['ipi', 'dashboard'] })
      toast.success('IPI calculated successfully')
    },
    onError: (err: Error, _variables, context) => {
      const ctx = (context as unknown) as Context | undefined
      if (ctx?.toastId) toast.dismiss(ctx.toastId)
      toast.error(err.message ?? 'IPI calculation failed')
    },
  })
}

/** Fetches events from top narratives and merges/sorts by timestamp for timeline view */
export function useCompanyTimelineEvents(
  narrativeIds: string[],
  limitPerNarrative = 10
) {
  const ids = Array.isArray(narrativeIds) ? narrativeIds.slice(0, 3) : []

  const results = useQueries({
    queries: ids.map((nid) => ({
      queryKey: ipiKeys.narrativeEvents(nid, 0, limitPerNarrative),
      queryFn: () =>
        ipiApi.getNarrativeEvents(nid, 0, limitPerNarrative),
      enabled: !!nid,
    })),
  })

  const events = useMemo(() => {
    const all: NarrativeEvent[] = []
    const seen = new Set<string>()
    for (const r of results) {
      const data = r.data
      const items = Array.isArray(data?.data) ? data.data : []
      for (const ev of items) {
        if (ev?.event_id && !seen.has(ev.event_id)) {
          seen.add(ev.event_id)
          all.push(ev)
        }
      }
    }
    return all.sort((a, b) => {
      const ta = a.original_timestamp ?? a.ingestion_timestamp ?? ''
      const tb = b.original_timestamp ?? b.ingestion_timestamp ?? ''
      return tb.localeCompare(ta)
    })
  }, [results])

  const isLoading = results.some((r) => r.isLoading)

  return { data: events, isLoading }
}

export function useRequestExport() {
  return useMutation({
    mutationFn: ({
      companyId,
      windowStart,
      windowEnd,
      format,
    }: {
      companyId: string
      windowStart: string
      windowEnd: string
      format?: 'json' | 'pdf' | 'both'
    }) =>
      ipiApi.requestExport(companyId, windowStart, windowEnd, format ? { format } : undefined),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Export started. You will receive an email when ready.')
    },
    onError: (err: Error) => toast.error(err.message || 'Export request failed'),
  })
}

export function useExportIPIArtifact() {
  return useMutation({
    mutationFn: (params: {
      companyId: string
      windowStart: string
      windowEnd: string
      viewId?: string
      narrativeId?: string
      includeNarratives?: string[]
      format?: 'json' | 'pdf' | 'both'
    }) =>
      exportApi.postExportIPIArtifact({
        companyId: params.companyId,
        windowStart: params.windowStart,
        windowEnd: params.windowEnd,
        viewId: params.viewId,
        includeNarratives:
          params.includeNarratives ??
          (params.narrativeId ? [params.narrativeId] : undefined),
        format: params.format,
      }),
    onError: (err: Error) => toast.error(err.message ?? 'Export failed'),
  })
}
