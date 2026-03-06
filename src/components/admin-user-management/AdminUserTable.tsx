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
import { MoreHorizontal, Mail, Ban, User, Key, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminUser } from '@/types/admin'
import { cn } from '@/lib/utils'

export type SortField = 'email' | 'username' | 'createdAt' | 'lastLogin' | 'status' | 'role'
export type SortKey = SortField
export type SortDir = 'asc' | 'desc'

export interface AdminUserTableProps {
  users: AdminUser[]
  isLoading?: boolean
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
  isResending?: boolean
  isDisabling?: boolean
}

export function AdminUserTable({
  users,
  isLoading = false,
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
      <div className="flex flex-wrap items-center gap-4">
        {onSearchChange && (
          <Input
            placeholder="Search users..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchChange(e.target.value)
            }}
            className="w-48 md:w-64"
            aria-label="Search users"
          />
        )}
        {onRoleFilterChange && (
          <Select value={roleFilter || 'all'} onValueChange={(v) => onRoleFilterChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-36">
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
            <SelectTrigger className="w-40">
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

      <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-card">
        {isLoading ? (
          <div className="space-y-2 p-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <Table>
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
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('username')}
                  >
                    Username
                    <SortIcon f="username" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <SortIcon f="email" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('role')}
                  >
                    Role
                    <SortIcon f="role" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <SortIcon f="status" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('lastLogin')}
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
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!u.isVerified && onResendVerification && (
                          <DropdownMenuItem
                            onClick={() => onResendVerification(u.id)}
                            disabled={isResending}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Resend verification
                          </DropdownMenuItem>
                        )}
                        {onEditRoles && (
                          <DropdownMenuItem onClick={() => onEditRoles(u)}>
                            <User className="mr-2 h-4 w-4" />
                            Edit roles
                          </DropdownMenuItem>
                        )}
                        {onResetPassword && (
                          <DropdownMenuItem onClick={() => onResetPassword(u.id)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset password
                          </DropdownMenuItem>
                        )}
                        {u.status !== 'disabled' && onDisable && (
                          <DropdownMenuItem
                            onClick={() => onDisable(u.id)}
                            disabled={isDisabling}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
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
