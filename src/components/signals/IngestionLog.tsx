/**
 * IngestionLog - small panel showing last ingestion timestamp and status
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface IngestionLogProps {
  lastIngestionAt?: string | null
  status?: 'idle' | 'success' | 'error'
  message?: string | null
  className?: string
  isLoading?: boolean
}

export function IngestionLog({
  lastIngestionAt,
  status = 'idle',
  message,
  className,
  isLoading = false,
}: IngestionLogProps) {
  const dateStr =
    lastIngestionAt != null && lastIngestionAt !== ''
      ? (() => {
          try {
            const d = new Date(lastIngestionAt)
            return isNaN(d.getTime()) ? null : format(d, 'MMM d, yyyy HH:mm')
          } catch {
            return null
          }
        })()
      : null

  if (isLoading) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            Ingestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardContent>
      </Card>
    )
  }

  const StatusIcon =
    status === 'success' ? CheckCircle : status === 'error' ? AlertCircle : Clock
  const statusClass =
    status === 'success'
      ? 'text-success'
      : status === 'error'
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <Card className={cn('card-surface', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          Ingestion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-4 w-4 shrink-0', statusClass)} aria-hidden />
          <span className="text-sm">
            {dateStr ?? 'No recent ingestion'}
          </span>
        </div>
        {message != null && message !== '' && (
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        )}
      </CardContent>
    </Card>
  )
}
