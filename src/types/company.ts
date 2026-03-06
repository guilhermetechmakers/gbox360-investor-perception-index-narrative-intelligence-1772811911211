export interface Company {
  id: string
  name: string
  ticker?: string
  sector?: string
  created_at?: string
}

export interface CompanySearchResult extends Company {
  match_type?: 'ticker' | 'name'
}
