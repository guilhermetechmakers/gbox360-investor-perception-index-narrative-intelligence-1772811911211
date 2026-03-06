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
