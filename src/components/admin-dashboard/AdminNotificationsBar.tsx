import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { X, AlertTriangle, AlertCircle, Info, CircleAlert, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminNotification } from '@/api/admin-dashboard'

interface AdminNotificationsBarProps {
  notifications?: AdminNotification[] | null
  onDismiss?: (id: string) => void
  onAcknowledge?: (id: string) => void
  onEmptyStateCtaClick?: () => void
  emptyStateCtaLabel?: string
  isLoading?: boolean
  error?: string | null
}

/** Severity styles using design tokens (destructive, accent, primary, muted from theme) */
const SEVERITY_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

const SEVERITY_STYLES = {
  critical: 'border-destructive/50 bg-destructive/5',
  warning: 'border-accent/50 bg-accent/5',
  info: 'border-primary/20 bg-muted/50',
} as const

const SEVERITY_ICON_CLASSES = {
  critical: 'text-destructive',
  warning: 'text-accent',
  info: 'text-muted-foreground',
} as const

export function AdminNotificationsBar({
  notifications,
  onDismiss,
  onAcknowledge,
  onEmptyStateCtaClick,
  emptyStateCtaLabel = 'View dashboard',
  isLoading = false,
  error = null,
}: AdminNotificationsBarProps) {
  const items = Array.isArray(notifications) ? notifications : []
  const unacknowledged = items.filter((n) => !n.acknowledged)
  const displayList = unacknowledged.slice(0, 5)

  if (isLoading) {
    return (
      <section aria-labelledby="admin-notifications-heading" className="space-y-2">
        <h2 id="admin-notifications-heading" className="sr-only">
          Notifications
        </h2>
        <div role="status" aria-label="Loading notifications" className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border-border rounded-lg"
              aria-hidden
            >
              <CardContent className="flex items-start gap-4 p-4">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 max-w-[200px]" />
                  <Skeleton className="h-3 w-full max-w-[280px]" />
                  <Skeleton className="h-3 w-1/3 max-w-[120px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section aria-labelledby="admin-notifications-heading">
        <h2 id="admin-notifications-heading" className="sr-only">
          Notifications
        </h2>
        <Card className="overflow-hidden border-border border-destructive/50 bg-destructive/5 rounded-lg">
          <CardContent className="flex items-start gap-3 p-4">
            <CircleAlert
              className="h-5 w-5 shrink-0 text-destructive"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Could not load notifications
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (displayList.length === 0) {
    return (
      <section aria-labelledby="admin-notifications-heading" className="space-y-2">
        <h2 id="admin-notifications-heading" className="sr-only">
          Notifications
        </h2>
        <Card
          className="overflow-hidden border-border bg-card rounded-lg transition-shadow duration-200 hover:shadow-card-hover"
          role="status"
          aria-label="No unacknowledged notifications"
        >
          <CardContent className="flex flex-col items-center justify-center py-10 px-4 text-center sm:py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Bell className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No unacknowledged notifications
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              You're all caught up. New alerts will appear here when they occur.
            </p>
            {onEmptyStateCtaClick ? (
              <Button
                variant="default"
                size="sm"
                onClick={onEmptyStateCtaClick}
                className="mt-6 min-h-[44px] px-6 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={emptyStateCtaLabel}
              >
                {emptyStateCtaLabel}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="mt-6 min-h-[44px] px-6 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={emptyStateCtaLabel}
                asChild
              >
                <Link to="/admin">{emptyStateCtaLabel}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section aria-labelledby="admin-notifications-heading" className="space-y-2">
      <h2 id="admin-notifications-heading" className="sr-only">
        Notifications
      </h2>
      <div role="region" aria-label="Admin notifications" className="space-y-2">
        {(displayList ?? []).map((n) => {
        const Icon = SEVERITY_ICONS[n.severity] ?? Info
        const style = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info
        const iconClass = SEVERITY_ICON_CLASSES[n.severity] ?? SEVERITY_ICON_CLASSES.info
        return (
          <Card
            key={n.id}
            className={cn(
              'overflow-hidden border border-border transition-all duration-200 rounded-lg hover:shadow-card-hover',
              style
            )}
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Icon
                  className={cn('h-5 w-5 shrink-0 mt-0.5', iconClass)}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                  {n.actionUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-accent focus-visible:ring-ring"
                      asChild
                    >
                      <a href={n.actionUrl}>View details</a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                {!n.acknowledged && onAcknowledge && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAcknowledge(n.id)}
                    className="text-xs min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 focus-visible:ring-ring"
                  >
                    Acknowledge
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-8 sm:w-8 focus-visible:ring-ring"
                    onClick={() => onDismiss(n.id)}
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>
    </section>
  )
}
