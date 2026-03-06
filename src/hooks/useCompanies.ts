import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/api/companies'
import { toast } from 'sonner'

export const companyKeys = {
  all: ['companies'] as const,
  search: (q: string) => [...companyKeys.all, 'search', q] as const,
  saved: () => [...companyKeys.all, 'saved'] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
}

export function useCompanySearch(query: string) {
  return useQuery({
    queryKey: companyKeys.search(query),
    queryFn: () => companiesApi.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  })
}

export function useSavedCompanies() {
  return useQuery({
    queryKey: companyKeys.saved(),
    queryFn: companiesApi.getSaved,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  })
}

export function useSaveCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId: string) => companiesApi.save(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.saved() })
      toast.success('Company saved')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save'),
  })
}

export function useRemoveSavedCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId: string) => companiesApi.removeSaved(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.saved() })
      toast.success('Company removed from saved')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to remove'),
  })
}
