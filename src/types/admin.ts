/**
 * Admin User Management types
 * Maps to backend models with runtime validation support
 */

export type UserStatus = 'active' | 'disabled' | 'pending_verification'

export type UserRole = 'admin' | 'operator' | 'auditor' | 'user'

export interface AdminUser {
  id: string
  username: string
  email: string
  roles: string[]
  status: UserStatus
  lastLogin?: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
  metadata?: Record<string, unknown>
  /** Legacy field mapping */
  full_name?: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface AuditEntry {
  id: string
  targetUserId: string
  action: string
  timestamp: string
  payload?: unknown
}

export interface AdminUsersParams {
  search?: string
  role?: string
  status?: string
  sort?: string
  page?: number
  limit?: number
}

export interface AdminUsersResponse {
  data: AdminUser[]
  count: number
  page: number
  limit: number
}

export interface AuditExportParams {
  userId?: string
  from?: string
  to?: string
  limit?: number
}

/** Alias for audit export params */
export type AdminAuditsParams = AuditExportParams

/** Admin Dashboard - Ingestion & System Health */
export interface IngestionSource {
  id: string
  name: string
  lastIngestTime?: string
  throughput?: number
  errorCount?: number
  rateLimit?: number
  rateLimitWarnings?: string[]
  status: 'healthy' | 'degraded' | 'error'
}

export interface IngestionStatusResponse {
  sources: IngestionSource[]
}

export interface SystemQueue {
  id: string
  name: string
  depth: number
  lastUpdated?: string
  errorCount: number
  retryCount: number
}

export interface SystemHealthResponse {
  queues: SystemQueue[]
  healthScore?: number
}

export interface AdminAction {
  id: string
  actionType: string
  userId?: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface AdminActionsResponse {
  actions: AdminAction[]
}

export interface RawPayload {
  id: string
  rawPayload?: string
  provenance?: Record<string, unknown>
  timestamp: string
  source?: string
}

export interface PayloadsResponse {
  data: RawPayload[]
  count: number
  page: number
  limit: number
}

export interface NarrativeEvent {
  id: string
  source?: string
  speaker?: string
  audience?: string
  raw_text?: string
  timestamps?: Record<string, string>
  signedArtifactUrl?: string
}

export interface AuditArtifact {
  id: string
  narrativeEventId: string
  artifactUrl?: string
  createdAt: string
}

export interface SignEventsParams {
  narrativeEventIds: string[]
  companyId?: string
  timeWindow?: { from: string; to: string }
}

export interface SignEventsResponse {
  artifacts: AuditArtifact[]
}

/** Normalize API User to AdminUser for admin UI */
export function toAdminUser(
  u: { id: string; email: string; full_name?: string; email_verified?: boolean; created_at: string; updated_at: string; role?: string; last_login?: string; roles?: string[] }
): AdminUser {
  const roles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['user'])
  const isVerified = u.email_verified === true
  const status: UserStatus =
    u.email_verified === false ? 'pending_verification' : 'active'
  return {
    id: u.id,
    username: u.full_name ?? u.email?.split('@')[0] ?? '—',
    email: u.email,
    roles,
    status,
    lastLogin: u.last_login,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    isVerified,
    full_name: u.full_name,
  }
}
