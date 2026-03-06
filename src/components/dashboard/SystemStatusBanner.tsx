import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemStatus } from '@/types/dashboard'

interface SystemStatusBannerProps {
  status: SystemStatus | null | undefined
  /** When true, shows a loading skeleton instead of content */
  isLoading?: boolean
  canRetry?: boolean
  onRetry?: () => void
  className?: string
}

function getStatusAriaLabel(status: SystemStatus): string {
  const statusLabel =
    status.status === 'error'
      ? 'Error'
      : status.status === 'degraded' || status.status === 'stale'
        ? 'Degraded'
        : 'OK'
  return `System status: ${statusLabel}. ${status.message}`
}

export function SystemStatusBanner({
  status,
  isLoading = false,
  canRetry = false,
  onRetry,
  className,
}: SystemStatusBannerProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between',
          'animate-fade-in',
          className
        )}
        aria-busy="true"
        aria-label="System status is being checked"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    )
  }

  if (!status || status.status === 'ok') return null

  const Icon =
    status.status === 'error'
      ? AlertCircle
      : status.status === 'degraded' || status.status === 'stale'
        ? AlertTriangle
        : CheckCircle

  const variant =
    status.status === 'error'
      ? 'border-border bg-destructive/10 border-l-4 border-l-destructive'
      : status.status === 'degraded' || status.status === 'stale'
        ? 'border-border bg-accent/10 border-l-4 border-l-accent'
        : 'border-border bg-muted/50'

  const iconColor =
    status.status === 'error'
      ? 'text-destructive'
      : status.status === 'degraded' || status.status === 'stale'
        ? 'text-accent'
        : 'text-muted-foreground'

  return (
    <div
      role="alert"
      aria-label={getStatusAriaLabel(status)}
      className={cn(
        'flex flex-col gap-3 rounded-lg border px-4 py-3 shadow-card transition-shadow duration-200',
        'sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        'hover:shadow-card-hover',
        variant,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={cn('h-5 w-5 shrink-0', iconColor)} aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {status.message}
          </p>
          {status.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated: {new Date(status.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      {canRetry && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 w-full sm:w-auto transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Retry loading system status"
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
          Retry
        </Button>
      )}
    </div>
  )
}
