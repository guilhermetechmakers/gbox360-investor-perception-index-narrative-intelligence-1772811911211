import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Activity, RefreshCw, AlertCircle } from 'lucide-react'
import type { ActivityLog } from '@/types/admin'
import { cn } from '@/lib/utils'

export interface ActivityLogListProps {
  logs: ActivityLog[]
  isLoading?: boolean
  /** When set, shows error state with optional retry CTA */
  error?: string | null
  emptyMessage?: string
  emptyDescription?: string
  /** Optional refresh callback; when provided, empty state shows a Refresh CTA with loading state */
  onRefresh?: () => void
  isRefreshing?: boolean
  /** Optional CTA when empty and onRefresh is not provided: label for the button/link */
  emptyCtaLabel?: string
  /** Optional CTA when empty and onRefresh is not provided: href for a link (e.g. /admin/users) */
  emptyCtaHref?: string
  /** Optional CTA when empty and onRefresh is not provided: click handler instead of link */
  onEmptyCtaClick?: () => void
  /** Accessible label for the list (e.g. "Recent activity log") */
  ariaLabel?: string
  /** Optional id of the heading that labels this list (for aria-labelledby) */
  labelledById?: string
  className?: string
}

export function ActivityLogList({
  logs,
  isLoading = false,
  error = null,
  emptyMessage = 'No recent activity',
  emptyDescription = 'Activity will appear here when this user performs actions.',
  onRefresh,
  isRefreshing = false,
  emptyCtaLabel = 'View user management',
  emptyCtaHref = '/admin/users',
  onEmptyCtaClick,
  ariaLabel = 'Recent activity log',
  labelledById,
  className,
}: ActivityLogListProps) {
  const items = Array.isArray(logs) ? logs : []

  if (isLoading) {
    return (
      <div
        className={cn('space-y-2', className)}
        role="status"
        aria-live="polite"
        aria-label="Loading activity log"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border bg-muted/20 px-4 py-10 text-center shadow-card transition-shadow duration-200',
          className
        )}
        role="alert"
        aria-live="assertive"
        aria-label="Activity log error"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-destructive/10 text-destructive"
          aria-hidden
        >
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-foreground">Unable to load activity</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            aria-label={isRefreshing ? 'Retrying' : 'Retry loading activity log'}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Retrying…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                Retry
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  if (items.length === 0) {
    const showRefreshCta = Boolean(onRefresh)
    const showCustomCta = !showRefreshCta && (onEmptyCtaClick != null || emptyCtaHref != null)

    return (
      <div
        className={cn(
          'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border bg-muted/20 px-4 py-10 text-center shadow-card transition-shadow duration-200',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="No recent activity recorded"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"
          aria-hidden
        >
          <Activity className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        {showRefreshCta && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            aria-label={isRefreshing ? 'Refreshing activity' : 'Refresh activity log'}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                Refresh
              </>
            )}
          </Button>
        )}
        {showCustomCta && onEmptyCtaClick != null && (
          <Button
            variant="default"
            size="sm"
            className="mt-4 transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onEmptyCtaClick}
            aria-label={emptyCtaLabel}
          >
            {emptyCtaLabel}
          </Button>
        )}
        {showCustomCta && onEmptyCtaClick == null && emptyCtaHref != null && (
          <Button
            variant="default"
            size="sm"
            className="mt-4 transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            asChild
            aria-label={emptyCtaLabel}
          >
            <Link to={emptyCtaHref}>{emptyCtaLabel}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <ScrollArea
      className={cn('h-[200px]', className)}
      aria-label={labelledById ? undefined : ariaLabel}
      aria-labelledby={labelledById}
      role="region"
    >
      <ul className="space-y-2 pr-4" role="list">
        {items.map((log) => (
          <li
            key={log.id}
            role="listitem"
            className={cn(
              'flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm',
              'transition-colors duration-150 hover:bg-muted/50 hover:shadow-sm'
            )}
          >
            <span className="font-medium text-foreground">{log.action}</span>
            <time
              dateTime={new Date(log.timestamp).toISOString()}
              className="text-xs text-muted-foreground"
            >
              {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
            </time>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
