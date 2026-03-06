/** Dashboard-specific types for IPI workflow */

export interface SystemStatus {
  status: 'ok' | 'degraded' | 'error' | 'stale'
  message: string
  lastUpdated: string
}

export interface TimeWindowPreset {
  label: string
  start: Date
  end: Date
}
