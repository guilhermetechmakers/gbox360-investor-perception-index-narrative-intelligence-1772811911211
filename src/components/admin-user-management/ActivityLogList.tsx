import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import type { ActivityLog } from '@/types/admin'
import { cn } from '@/lib/utils'

export interface ActivityLogListProps {
  logs: ActivityLog[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function ActivityLogList({
  logs,
  isLoading = false,
  emptyMessage = 'No recent activity',
  className,
}: ActivityLogListProps) {
  const items = logs ?? []

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className={cn('py-6 text-center text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <ScrollArea className={cn('h-[200px]', className)}>
      <div className="space-y-2 pr-4">
        {items.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
          >
            <span className="font-medium">{log.action}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
