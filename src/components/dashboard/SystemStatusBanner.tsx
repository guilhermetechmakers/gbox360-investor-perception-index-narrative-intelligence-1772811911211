import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemStatus } from '@/types/dashboard'

interface SystemStatusBannerProps {
  status: SystemStatus | null | undefined
  canRetry?: boolean
  onRetry?: () => void
  className?: string
}

export function SystemStatusBanner({
  status,
  canRetry = false,
  onRetry,
  className,
}: SystemStatusBannerProps) {
  if (!status || status.status === 'ok') return null

  const Icon =
    status.status === 'error'
      ? AlertCircle
      : status.status === 'degraded'
        ? AlertTriangle
        : status.status === 'stale'
          ? AlertTriangle
          : CheckCircle

  const variant =
    status.status === 'error'
      ? 'border-destructive/50 bg-destructive/10'
      : status.status === 'degraded' || status.status === 'stale'
        ? 'border-accent/50 bg-accent/10'
        : 'border-muted bg-muted/50'

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border px-4 py-3',
        variant,
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={cn(
            'h-5 w-5 shrink-0',
            status.status === 'error' && 'text-destructive',
            (status.status === 'degraded' || status.status === 'stale') && 'text-accent'
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{status.message}</p>
          {status.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated: {new Date(status.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      {canRetry && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}
