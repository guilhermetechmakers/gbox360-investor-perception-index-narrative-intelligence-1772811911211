import { api } from '@/lib/api'
import type { Company, CompanySearchResult } from '@/types/company'

export const companiesApi = {
  search: async (query: string): Promise<CompanySearchResult[]> =>
    api.get<CompanySearchResult[]>(`/companies/search?q=${encodeURIComponent(query)}`),

  getById: async (id: string): Promise<Company> =>
    api.get<Company>(`/companies/${id}`),

  getSaved: async (): Promise<Company[]> =>
    api.get<Company[]>('/companies/saved'),

  save: async (companyId: string): Promise<void> =>
    api.post(`/companies/saved`, { company_id: companyId }),

  removeSaved: async (companyId: string): Promise<void> =>
    api.delete(`/companies/saved/${companyId}`),
}
