import { useMemo, useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Mail, Ban, User, Key, ArrowUpDown, ArrowUp, ArrowDown, UserPlus, AlertCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminUser } from '@/types/admin'
import { cn } from '@/lib/utils'

export type SortField = 'email' | 'username' | 'createdAt' | 'lastLogin' | 'status' | 'role'
export type SortKey = SortField
export type SortDir = 'asc' | 'desc'

export interface AdminUserTableProps {
  users: AdminUser[]
  isLoading?: boolean
  error?: Error | null
  search?: string
  onSearchChange?: (v: string) => void
  roleFilter?: string
  onRoleFilterChange?: (v: string) => void
  statusFilter?: string
  onStatusFilterChange?: (v: string) => void
  sortField?: SortField
  sortKey?: SortKey
  sortDir?: SortDir
  onSort?: (field: SortField, dir: SortDir) => void
  selectedIds?: Set<string>
  onSelect?: (id: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onRowClick?: (user: AdminUser) => void
  onResendVerification?: (id: string) => void
  onDisable?: (id: string) => void
  onResetPassword?: (id: string) => void
  onEditRoles?: (user: AdminUser) => void
  /** Optional: when provided, empty state shows a CTA to create/invite a user */
  onCreateUser?: () => void
  /** Optional: when provided, error state shows a retry button */
  onRetry?: () => void
  isResending?: boolean
  isDisabling?: boolean
}

export function AdminUserTable({
  users,
  isLoading = false,
  error = null,
  search = '',
  onSearchChange,
  roleFilter = '',
  onRoleFilterChange,
  statusFilter = '',
  onStatusFilterChange,
  sortField = 'createdAt',
  sortKey,
  sortDir = 'desc',
  onSort,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  onRowClick,
  onResendVerification,
  onDisable,
  onResetPassword,
  onEditRoles,
  onCreateUser,
  onRetry,
  isResending = false,
  isDisabling = false,
}: AdminUserTableProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const list = users ?? []

  const effectiveSortField = sortKey ?? sortField

  const sorted = useMemo(() => {
    if (!onSort || list.length === 0) return list
    return [...list].sort((a, b) => {
      let cmp = 0
      switch (effectiveSortField) {
        case 'email':
          cmp = (a.email ?? '').localeCompare(b.email ?? '')
          break
        case 'username':
          cmp = (a.username ?? '').localeCompare(b.username ?? '')
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'lastLogin':
          cmp =
            (a.lastLogin ? new Date(a.lastLogin).getTime() : 0) -
            (b.lastLogin ? new Date(b.lastLogin).getTime() : 0)
          break
        case 'status':
          cmp = (a.status ?? '').localeCompare(b.status ?? '')
          break
        case 'role':
          cmp = ((a.roles?.[0] ?? '') as string).localeCompare((b.roles?.[0] ?? '') as string)
          break
        default:
          return 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [list, effectiveSortField, sortDir, onSort])

  const handleSort = useCallback(
    (field: SortField) => {
      onSort?.(field, effectiveSortField === field && sortDir === 'asc' ? 'desc' : 'asc')
    },
    [effectiveSortField, sortDir, onSort]
  )

  const allSelected = list.length > 0 && (selectedIds?.size ?? 0) >= list.length

  const SortIcon = ({ f }: { f: SortField }) => {
    if (effectiveSortField !== f) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3 shadow-sm">
        {onSearchChange && (
          <Input
            placeholder="Search users..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchChange(e.target.value)
            }}
            className="w-full min-w-0 sm:w-48 md:w-64 rounded-md border-border bg-background"
            aria-label="Search users by email or username"
          />
        )}
        {onRoleFilterChange && (
          <Select value={roleFilter || 'all'} onValueChange={(v) => onRoleFilterChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-36 rounded-md border-border" aria-label="Filter by role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
              <SelectItem value="auditor">Auditor</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        )}
        {onStatusFilterChange && (
          <Select value={statusFilter || 'all'} onValueChange={(v) => onStatusFilterChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-40 rounded-md border-border" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="pending_verification">Pending verification</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card">
        {error ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center animate-fade-in"
            role="alert"
            aria-live="assertive"
            aria-describedby="admin-users-error-desc"
          >
            <div className="rounded-full border border-destructive/30 bg-destructive/10 p-3" aria-hidden>
              <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
            </div>
            <div className="space-y-1" id="admin-users-error-desc">
              <p className="font-medium text-foreground">Unable to load users</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="mt-2 transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Try again to load users"
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                Try again
              </Button>
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-0" role="status" aria-busy="true" aria-label="Loading users">
            <Table>
              <TableHeader>
                <TableRow>
                  {onSelectAll && (
                    <TableHead className="w-12">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableHead>
                  )}
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i}>
                    {onSelectAll && (
                      <TableCell>
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                    )}
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in"
            role="status"
            aria-live="polite"
            aria-describedby="admin-users-empty-desc"
          >
            <div className="rounded-full border border-border bg-muted/50 p-4" aria-hidden>
              <User className="mb-0 h-12 w-12 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 font-medium text-foreground">No users found</p>
            <p id="admin-users-empty-desc" className="mt-1 max-w-sm text-sm text-muted-foreground">
              {list.length === 0
                ? 'Get started by adding or inviting a user. Use Import CSV in the panel or set up an invite link for new signups.'
                : 'Try adjusting your search or filters to see more results.'}
            </p>
            {onCreateUser && (
              <Button
                onClick={onCreateUser}
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring rounded-lg shadow-sm transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Add or invite a new user"
              >
                <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                Add user
              </Button>
            )}
          </div>
        ) : (
          <Table aria-label="User list">
            <TableHeader>
              <TableRow>
                {onSelectAll && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(c) => onSelectAll(!!c)}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    onClick={() => handleSort('username')}
                    aria-label={effectiveSortField === 'username' ? `Sort by username ${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'Sort by username'}
                  >
                    Username
                    <SortIcon f="username" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    onClick={() => handleSort('email')}
                    aria-label={effectiveSortField === 'email' ? `Sort by email ${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'Sort by email'}
                  >
                    Email
                    <SortIcon f="email" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    onClick={() => handleSort('role')}
                    aria-label={effectiveSortField === 'role' ? `Sort by role ${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'Sort by role'}
                  >
                    Role
                    <SortIcon f="role" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    onClick={() => handleSort('status')}
                    aria-label={effectiveSortField === 'status' ? `Sort by status ${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'Sort by status'}
                  >
                    Status
                    <SortIcon f="status" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    onClick={() => handleSort('lastLogin')}
                    aria-label={effectiveSortField === 'lastLogin' ? `Sort by last login ${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'Sort by last login'}
                  >
                    Last login
                    <SortIcon f="lastLogin" />
                  </button>
                </TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((u) => (
                <TableRow
                  key={u.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50',
                    (selectedIds?.has?.(u.id) ?? false) && 'bg-muted/30'
                  )}
                  onClick={() => onRowClick?.(u)}
                >
                  {onSelectAll && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds?.has?.(u.id) ?? false}
                        onCheckedChange={(c) => onSelect?.(u.id, !!c)}
                        aria-label={`Select ${u.email}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{u.username ?? '—'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(u.roles ?? []).map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {r}
                        </Badge>
                      ))}
                      {(!u.roles || u.roles.length === 0) && '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === 'active'
                          ? 'success'
                          : u.status === 'disabled'
                            ? 'destructive'
                            : 'accent'
                      }
                    >
                      {u.status ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-md focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`Open actions for ${u.email}`}
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg border-border">
                        {!u.isVerified && onResendVerification && (
                          <DropdownMenuItem
                            onClick={() => onResendVerification(u.id)}
                            disabled={isResending}
                            aria-label={`Resend verification email to ${u.email}`}
                          >
                            <Mail className="mr-2 h-4 w-4" aria-hidden />
                            Resend verification
                          </DropdownMenuItem>
                        )}
                        {onEditRoles && (
                          <DropdownMenuItem
                            onClick={() => onEditRoles(u)}
                            aria-label={`Edit roles for ${u.email}`}
                          >
                            <User className="mr-2 h-4 w-4" aria-hidden />
                            Edit roles
                          </DropdownMenuItem>
                        )}
                        {onResetPassword && (
                          <DropdownMenuItem
                            onClick={() => onResetPassword(u.id)}
                            aria-label={`Reset password for ${u.email}`}
                          >
                            <Key className="mr-2 h-4 w-4" aria-hidden />
                            Reset password
                          </DropdownMenuItem>
                        )}
                        {u.status !== 'disabled' && onDisable && (
                          <DropdownMenuItem
                            onClick={() => onDisable(u.id)}
                            disabled={isDisabling}
                            className="text-destructive"
                            aria-label={`Disable account for ${u.email}`}
                          >
                            <Ban className="mr-2 h-4 w-4" aria-hidden />
                            Disable account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
