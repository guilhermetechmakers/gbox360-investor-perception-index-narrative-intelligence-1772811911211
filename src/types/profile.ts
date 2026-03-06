/** User Profile page types - activity, saved companies with meta */

export interface ProfileActivityItem {
  id: string
  userId: string
  type: 'check' | 'export' | 'admin_action' | 'company_view' | 'drilldown' | 'login' | 'profile_update'
  description: string
  timestamp: string
  source?: string
  metadata?: Record<string, unknown>
}

export interface ProvisionalWeightPreviewInput {
  companyId?: string
  timeWindow?: { from: string; to: string }
  weights: { narrative: number; credibility: number; risk: number }
}

export interface ProvisionalWeightPreviewResult {
  score: number
  delta: number
  narrative: number
  credibility: number
  risk: number
}

export interface SavedCompanyWithMeta {
  id: string
  name: string
  ticker?: string
  sector?: string
  score?: number
  lastViewed?: string
  savedAt?: string
}
