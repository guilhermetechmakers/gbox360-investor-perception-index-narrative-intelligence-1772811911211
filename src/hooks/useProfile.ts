import { useQuery, useMutation } from '@tanstack/react-query'
import { profileApi } from '@/api/profile'
import type { ProvisionalWeightPreviewInput } from '@/types/profile'


export const profileKeys = {
  activity: ['profile', 'activity'] as const,
}

export function useProfileActivity(limit = 20) {
  return useQuery({
    queryKey: [...profileKeys.activity, limit],
    queryFn: () => profileApi.getActivity(limit),
    staleTime: 1000 * 60 * 2,
    placeholderData: [],
  })
}

export function useProvisionalWeightPreview() {
  return useMutation({
    mutationFn: (input: ProvisionalWeightPreviewInput) =>
      profileApi.getProvisionalWeightPreview(input),
  })
}
