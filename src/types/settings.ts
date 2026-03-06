/** Settings & Preferences types for Gbox360 */

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  organization?: string
  role?: string
  locale?: string
  timezone?: string
  twoFactorEnabled?: boolean
}

export interface UserPreferences {
  userId: string
  ingestNotifications: boolean
  weeklySummary: boolean
  exportNotifications: boolean
}

export interface ProvisionalWeights {
  userId: string
  scenarioName: string
  narrative: number
  credibility: number
  risk: number
  isCustom: boolean
  updatedAt?: string
}

export interface DataExport {
  userId: string
  format: 'csv' | 'json'
  status: 'pending' | 'completed' | 'failed'
  createdAt?: string
  downloadUrl?: string
}

export interface DataExportPreferences {
  format: 'csv' | 'json' | 'zip'
  scope: 'full' | 'minimal'
  frequency?: 'on_demand' | 'weekly'
  retentionNotes?: string
}

export interface ExportJobStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  artifact_url?: string | null
  created_at: string
  updated_at?: string
}

export const DEFAULT_WEIGHTS = {
  narrative: 40,
  credibility: 40,
  risk: 20,
} as const

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  ingestNotifications: true,
  weeklySummary: false,
  exportNotifications: true,
}
