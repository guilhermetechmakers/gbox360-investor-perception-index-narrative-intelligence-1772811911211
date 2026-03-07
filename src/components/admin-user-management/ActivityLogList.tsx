import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Activity, RefreshCw } from 'lucide-react'
import type { ActivityLog } from '@/types/admin'
import { cn } from '@/lib/utils'

export interface ActivityLogListProps {
  logs: ActivityLog[]
  isLoading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  /** Optional refresh callback; when provided, empty state shows a Refresh CTA with loading state */
  onRefresh?: () => void
  isRefreshing?: boolean
  /** Accessible label for the list (e.g. "Recent activity log") */
  ariaLabel?: string
  /** Optional id of the heading that labels this list (for aria-labelledby) */
  labelledById?: string
  className?: string
}

export function ActivityLogList({
  logs,
  isLoading = false,
  emptyMessage = 'No recent activity',
  emptyDescription = 'Activity will appear here when this user performs actions.',
  onRefresh,
  isRefreshing = false,
  ariaLabel = 'Recent activity log',
  labelledById,
  className,
}: ActivityLogListProps) {
  const items = logs ?? []

  if (isLoading) {
    return (
      <div
        className={cn('space-y-2', className)}
        role="status"
        aria-live="polite"
        aria-label="Loading activity log"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] flex-col items-center justify-center rounded-[10px] border border-border bg-muted/20 py-10 px-4 text-center shadow-card transition-shadow duration-200',
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
        <h3 className="text-sm font-medium text-foreground">{emptyMessage}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyDescription}
        </p>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
      <ul
        className="space-y-2 pr-4"
        role="list"
      >
        {(items ?? []).map((log) => (
          <li
            key={log.id}
            role="listitem"
            className={cn(
              'flex flex-col gap-0.5 rounded-[10px] border border-border bg-muted/30 px-3 py-2 text-sm',
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
