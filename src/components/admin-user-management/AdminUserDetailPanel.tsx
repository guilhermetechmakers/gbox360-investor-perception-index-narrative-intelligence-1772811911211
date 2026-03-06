import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mail, Ban, Key } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminUser, ActivityLog } from '@/types/admin'
import { RoleSelector } from './RoleSelector'
import { ActivityLogList } from './ActivityLogList'
import { ConfirmDialog } from './ConfirmDialog'
export interface AdminUserDetailPanelProps {
  user: AdminUser | null
  activity: ActivityLog[]
  activityLoading?: boolean
  /** Optional refetch for activity log; when provided, empty state shows Refresh button with loading state */
  onRefreshActivity?: () => void
  activityRefreshing?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateUser: (id: string, payload: { roles?: AdminUser['roles']; status?: AdminUser['status'] }) => void
  onResendVerification: (id: string) => void
  onDisable: (id: string) => void
  onResetPassword: (id: string) => void
  disablePending?: boolean
  resendPending?: boolean
}

export function AdminUserDetailPanel({
  user,
  activity,
  activityLoading = false,
  onRefreshActivity,
  activityRefreshing = false,
  open,
  onOpenChange,
  onUpdateUser,
  onResendVerification,
  onDisable,
  onResetPassword,
  disablePending = false,
  resendPending = false,
}: AdminUserDetailPanelProps) {
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  if (!user) return null

  const handleDisable = () => {
    onDisable(user.id)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" showClose>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{user.username ?? user.email}</h3>
                <Badge
                  variant={
                    user.status === 'active'
                      ? 'success'
                      : user.status === 'disabled'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-1">
                {(user.roles ?? []).map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p>{user.createdAt ? format(new Date(user.createdAt), 'PPpp') : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last updated</span>
                <p>{user.updatedAt ? format(new Date(user.updatedAt), 'PPpp') : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Verified</span>
                <p>{user.isVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Roles</h4>
              <RoleSelector
                value={user.roles ?? ['user']}
                onChange={(roles) => onUpdateUser(user.id, { roles })}
                allowMultiple={false}
              />
            </div>

            <Separator />

            <div>
              <h4 id="activity-log-heading" className="text-sm font-medium mb-2">Recent activity</h4>
              <ActivityLogList
                logs={activity}
                isLoading={activityLoading}
                ariaLabel="Recent activity log"
                labelledById="activity-log-heading"
                onRefresh={onRefreshActivity}
                isRefreshing={activityRefreshing}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {!user.isVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResendVerification(user.id)}
                  disabled={resendPending || user.status === 'disabled'}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(user.id)}
                disabled={user.status === 'disabled'}
              >
                <Key className="mr-2 h-4 w-4" />
                Reset password
              </Button>
              {user.status !== 'disabled' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDisableConfirm(true)}
                  disabled={disablePending}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Disable account
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDisableConfirm}
        onOpenChange={setShowDisableConfirm}
        title="Disable account"
        description={`Are you sure you want to disable ${user.email}? They will no longer be able to sign in.`}
        confirmLabel="Disable"
        variant="destructive"
        onConfirm={handleDisable}
        isLoading={disablePending}
      />
    </>
  )
}
