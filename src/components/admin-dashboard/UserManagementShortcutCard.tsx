/**
 * User management shortcut card for admin dashboard.
 * Design: card with 10–12px radius, border, focus-visible ring per design system.
 * Uses design tokens only; loading/error/empty states with full accessibility.
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, ChevronRight, AlertCircle, UserPlus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserManagementShortcutCardProps {
  totalUsers?: number
  activeCount?: number
  disabledCount?: number
  recentVerifications?: number
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
}

export function UserManagementShortcutCard({
  totalUsers = 0,
  activeCount = 0,
  disabledCount = 0,
  recentVerifications = 0,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load user stats.',
  onRetry,
}: UserManagementShortcutCardProps) {
  const hasUsers = totalUsers > 0
  const showEmpty = !isLoading && !isError && !hasUsers

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-300',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'border-border'
      )}
      aria-label="User management summary"
      role="region"
      aria-busy={isLoading}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
          <Users className="h-5 w-5 text-muted-foreground" aria-hidden />
          <span>User management</span>
        </CardTitle>
        {!isLoading && !isError && (
          <Button variant="ghost" size="sm" asChild>
            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-foreground hover:text-primary focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
              aria-label="View all users"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-label="User management loading"
          >
            <p className="text-sm text-muted-foreground" aria-hidden>
              Loading user stats…
            </p>
            <div className="space-y-2" aria-hidden>
              <Skeleton className="h-8 w-20 rounded-md bg-muted" />
              <Skeleton className="h-4 w-40 rounded-md bg-muted" />
              <Skeleton className="h-3 w-32 rounded-md bg-muted" />
            </div>
          </div>
        ) : isError ? (
          <div
            className="rounded-lg border border-border bg-muted/50 p-4 space-y-3"
            role="alert"
            aria-live="assertive"
            aria-label="User management error"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className="h-5 w-5 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Unable to load user stats
                </p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
            {typeof onRetry === 'function' && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onRetry}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Try again to load user stats"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            )}
          </div>
        ) : showEmpty ? (
          <div
            className="rounded-lg border border-border bg-muted/30 py-6 px-4 text-center space-y-3"
            role="status"
            aria-label="No users yet"
          >
            <UserPlus
              className="h-10 w-10 mx-auto text-muted-foreground"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No users yet</p>
              <p className="text-sm text-muted-foreground">
                User counts will appear here once users are added.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/admin/users"
                className="gap-2 border-border bg-background text-foreground"
                aria-label="Go to user management"
              >
                Manage users
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p
              className="text-2xl font-bold tabular-nums text-foreground"
              aria-label={`Total users: ${totalUsers}`}
            >
              {totalUsers}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeCount} active · {disabledCount} disabled
            </p>
            {recentVerifications > 0 && (
              <p className="text-xs text-muted-foreground">
                {recentVerifications} verifications in last 24h
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
