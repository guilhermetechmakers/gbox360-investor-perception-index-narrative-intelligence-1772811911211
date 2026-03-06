import { useQuery, useMutation } from '@tanstack/react-query'
import { ipiApi } from '@/api/ipi'
import { toast } from 'sonner'

export const ipiKeys = {
  snapshot: (companyId: string, start: string, end: string) =>
    ['ipi', 'snapshot', companyId, start, end] as const,
  dashboard: (companyIds: string[], start: string, end: string) =>
    ['ipi', 'dashboard', companyIds.join(','), start, end] as const,
  narrativeEvents: (
    narrativeId: string,
    page: number,
    limit: number,
    filters?: Record<string, string | number>
  ) => ['ipi', 'events', narrativeId, page, limit, filters] as const,
  rawPayload: (id: string) => ['ipi', 'raw-payload', id] as const,
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
  filters?: { source?: string; authority_min?: number }
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
