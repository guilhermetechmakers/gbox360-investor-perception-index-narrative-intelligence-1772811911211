/**
 * RBAC: Require Admin, Operator, or Auditor role for admin routes.
 * Admin: full access; Operator: operational replays and monitoring; Auditor: view-only audit trails.
 */
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useAuth'
import type { UserRole } from '@/types/user'

const ADMIN_ROLES: UserRole[] = ['admin', 'operator', 'auditor']

function hasAdminRole(role?: UserRole | string | null): boolean {
  if (!role) return false
  const r = typeof role === 'string' ? role.toLowerCase() : ''
  return ADMIN_ROLES.includes(r as UserRole)
}

function hasAnyAdminRole(roles?: string[] | null): boolean {
  if (!Array.isArray(roles) || roles.length === 0) return false
  return roles.some((r) => hasAdminRole(r))
}

export interface RequireAdminRoleProps {
  children: ReactNode
  /** Optional: require specific role(s). Default: any of admin, operator, auditor */
  roles?: UserRole[]
}

export function RequireAdminRole({ children, roles = ADMIN_ROLES }: RequireAdminRoleProps) {
  const { data: user, isLoading, error } = useCurrentUser()

  if (isLoading || error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-label="Loading"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const userRole = user?.role
  const userRoles = (user as { roles?: string[] })?.roles ?? (userRole ? [userRole] : [])

  const hasRole = hasAdminRole(userRole) || hasAnyAdminRole(userRoles)
  const devAllowAny =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_ADMIN_ALLOW_ANY === 'true'
  const allowed =
    devAllowAny && !!user
      ? true
      : roles.length === 0
        ? hasRole
        : hasRole &&
          (roles.includes(userRole as UserRole) || userRoles.some((ur) => roles.includes(ur as UserRole)))

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
