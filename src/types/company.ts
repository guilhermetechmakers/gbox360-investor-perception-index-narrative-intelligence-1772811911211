export interface Company {
  id: string
  name: string
  ticker?: string
  sector?: string
  exchange?: string
  metadata?: { industry?: string; region?: string }
  created_at?: string
}

export interface CompanySearchResult extends Company {
  match_type?: 'ticker' | 'name'
}

export interface CompanySuggestResponse {
  suggestions: CompanySearchResult[]
  page: number
  limit: number
  total?: number
  has_more?: boolean
}
