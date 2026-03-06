import { useQuery } from '@tanstack/react-query'
import { systemApi } from '@/api/system'

export const systemKeys = {
  status: () => ['system', 'status'] as const,
}

export function useSystemStatus() {
  return useQuery({
    queryKey: systemKeys.status(),
    queryFn: systemApi.getStatus,
    staleTime: 1000 * 60,
    retry: 1,
  })
}
