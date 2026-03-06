/**
 * Credibility Proxy & Risk Signals hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signalsApi } from '@/api/signals'
import { toast } from 'sonner'
import type { RecomputeSignalsRequest } from '@/types/signals'

export function useRecomputeSignals() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: RecomputeSignalsRequest) => signalsApi.recompute(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ipi'] })
      queryClient.invalidateQueries({ queryKey: ['narrative-events'] })
      toast.success(`Re-scored ${data?.updated_count ?? 0} events`)
    },
    onError: (err: Error) =>
      toast.error(err?.message ?? 'Re-score failed'),
  })
}
