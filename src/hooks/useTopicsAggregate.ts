/**
 * React Query hooks for Topics Aggregate API
 */
import { useQuery } from '@tanstack/react-query'
import { topicsApi } from '@/api/topics'
import type { TopicsAggregateParams } from '@/types/topic-persistence'

export const topicsKeys = {
  all: ['topics'] as const,
  aggregate: (params: TopicsAggregateParams) => [...topicsKeys.all, 'aggregate', params] as const,
}

export function useTopicsAggregate(params: TopicsAggregateParams | null) {
  return useQuery({
    queryKey: topicsKeys.aggregate(params ?? { window_start: '', window_end: '' }),
    queryFn: () => (params ? topicsApi.getAggregate(params) : Promise.resolve({ items: [] })),
    enabled: !!params?.window_start && !!params?.window_end,
  })
}
