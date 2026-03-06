import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AdminUserTable,
  AdminUserDetailPanel,
  BulkActionsPanel,
  AuditExportPanel,
} from '@/components/admin-user-management'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useAdminUsers,
  useAdminUser,
  useAdminUserActivity,
  useAdminUpdateUser,
  useAdminDisableUser,
  useAdminResendVerification,
  useAdminResetPassword,
  useAdminImportCsv,
} from '@/hooks/useAdminUsers'
import type { SortField, SortDir } from '@/components/admin-user-management/AdminUserTable'
import { adminUsersApi } from '@/api/admin-users'
import { toast } from 'sonner'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function UserManagement() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  })

  const users = data?.data ?? []

  const { data: detailUser } = useAdminUser(detailUserId)
  const { data: activityLogs = [], isLoading: activityLoading } = useAdminUserActivity(detailUserId)

  const updateUser = useAdminUpdateUser()
  const disableUser = useAdminDisableUser()
  const resendVerification = useAdminResendVerification()
  const resetPassword = useAdminResetPassword()
  const importCsv = useAdminImportCsv()
  const [exportLoading, setExportLoading] = useState(false)
  const [auditExportLoading, setAuditExportLoading] = useState(false)

  const handleSort = useCallback((field: SortField, dir: SortDir) => {
    setSortField(field)
    setSortDir(dir)
  }, [])

  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(users.map((u) => u.id)))
    } else {
      setSelectedIds(new Set())
    }
  }, [users])

  const handleExportCsv = useCallback(async () => {
    setExportLoading(true)
    try {
      const blob = await adminUsersApi.exportCsv({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      downloadBlob(blob, `users-export-${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success('Export downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }, [debouncedSearch, roleFilter, statusFilter])

  const handleAuditExport = useCallback(async () => {
    setAuditExportLoading(true)
    try {
      const blob = await adminUsersApi.exportAudits()
      downloadBlob(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Audit export downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Audit export failed')
    } finally {
      setAuditExportLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">Back to overview</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-lg">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminUserTable
                users={users}
                isLoading={isLoading}
                search={search}
                onSearchChange={setSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onResendVerification={(id) => resendVerification.mutate(id)}
                onDisable={(id) => disableUser.mutate({ id })}
                onResetPassword={(id) => resetPassword.mutate(id)}
                onEditRoles={(u) => setDetailUserId(u.id)}
                onRowClick={(u) => setDetailUserId(u.id)}
                isResending={resendVerification.isPending}
                isDisabling={disableUser.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <BulkActionsPanel
            selectedCount={selectedIds.size}
            onImportCsv={(file) => importCsv.mutate(file)}
            onExportCsv={handleExportCsv}
            importLoading={importCsv.isPending}
            exportLoading={exportLoading}
          />
          <AuditExportPanel
            onExport={handleAuditExport}
            isLoading={auditExportLoading}
          />
        </div>
      </div>

      <AdminUserDetailPanel
        user={detailUser ?? null}
        activity={activityLogs}
        activityLoading={activityLoading}
        open={!!detailUserId}
        onOpenChange={(open) => !open && setDetailUserId(null)}
        onUpdateUser={(id, payload) => updateUser.mutate({ id, payload })}
        onResendVerification={(id) => resendVerification.mutate(id)}
        onDisable={(id) => disableUser.mutate({ id })}
        onResetPassword={(id) => resetPassword.mutate(id)}
        disablePending={disableUser.isPending}
        resendPending={resendVerification.isPending}
      />
    </div>
  )
}
