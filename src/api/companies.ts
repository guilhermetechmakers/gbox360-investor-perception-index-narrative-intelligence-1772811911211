import { api } from '@/lib/api'
import type { Company, CompanySearchResult, CompanySuggestResponse } from '@/types/company'

export const companiesApi = {
  /** Paginated suggestions with fuzzy matching - use for autocomplete */
  suggest: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<CompanySuggestResponse> => {
    const params = new URLSearchParams()
    params.set('query', query)
    params.set('page', String(page))
    params.set('limit', String(limit))
    try {
      const res = await api.get<CompanySuggestResponse | CompanySearchResult[]>(
        `/companies/suggest?${params.toString()}`
      )
      if (res && typeof res === 'object' && 'suggestions' in res) {
        return res as CompanySuggestResponse
      }
      const list = Array.isArray(res) ? res : []
      return {
        suggestions: list as CompanySearchResult[],
        page: 1,
        limit: list.length,
        has_more: false,
      }
    } catch {
      const list = await api.get<CompanySearchResult[]>(
        `/companies/search?q=${encodeURIComponent(query)}`
      )
      const safe = Array.isArray(list) ? list : []
      return {
        suggestions: safe,
        page: 1,
        limit: safe.length,
        has_more: false,
      }
    }
  },

  /** Search companies - use for simple autocomplete */
  search: async (query: string): Promise<CompanySearchResult[]> => {
    const res = await companiesApi.suggest(query, 1, 15)
    return res?.suggestions ?? []
  },

  getById: async (id: string): Promise<Company> =>
    api.get<Company>(`/companies/${id}`),

  getSaved: async (): Promise<Company[]> =>
    api.get<Company[]>('/companies/saved'),

  /** Per-user recent companies (fallback: returns saved if /recent not available) */
  getRecent: async (): Promise<Company[]> => {
    try {
      return api.get<Company[]>('/companies/recent')
    } catch {
      return companiesApi.getSaved()
    }
  },

  save: async (companyId: string): Promise<void> =>
    api.post(`/companies/saved`, { company_id: companyId }),

  removeSaved: async (companyId: string): Promise<void> =>
    api.delete(`/companies/saved/${companyId}`),
}
