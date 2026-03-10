import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'
import { AlertCircle, CheckCircle2, RotateCcw, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IngestError } from '@/types/ingest'

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

interface RecentErrorLogProps {
  errors: IngestError[]
  onRetry: (errorId: string) => void
  isLoading?: boolean
  /** When set, shows error state with retry CTA */
  error?: string | null
  /** Callback for empty state and error state CTA (e.g. refresh error log) */
  onRefresh?: () => void
  /** Label for empty/error state CTA button */
  emptyStateCtaLabel?: string
  /** When true, CTA button shows loading state */
  isRefreshing?: boolean
}

export function RecentErrorLog({
  errors = [],
  onRetry,
  isLoading = false,
  error = null,
  onRefresh,
  emptyStateCtaLabel = 'Refresh',
  isRefreshing = false,
}: RecentErrorLogProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const items = Array.isArray(errors) ? errors : []

  const handleRetry = async (errorId: string) => {
    if (retryingId) return
    setRetryingId(errorId)
    try {
      await Promise.resolve(onRetry(errorId))
    } finally {
      setRetryingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
            Recent error log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
            Recent error log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
            title="Couldn't load error log"
            description={error}
            action={
              onRefresh ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="min-h-[44px] px-6 bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={emptyStateCtaLabel}
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    emptyStateCtaLabel
                  )}
                </Button>
              ) : null
            }
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
          Recent error log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No recent errors"
            description="Error log will show here when ingest errors occur. Use the button below to refresh or check the pipeline."
            action={
              <Button
                variant="default"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing || !onRefresh}
                className="min-h-[44px] px-6 bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
                aria-label={emptyStateCtaLabel}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  emptyStateCtaLabel
                )}
              </Button>
            }
            className="py-8"
          />
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
              {(items ?? []).map((err) => {
                const isRetrying = retryingId === err.id
                return (
                  <div
                    key={err.id}
                    className={cn(
                      'flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-card'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(err.timestamp ?? '')} · Source: {err.sourceId ?? '—'}
                      </p>
                      <p className="text-sm font-medium mt-0.5 line-clamp-2 text-foreground">{err.message ?? 'Unknown error'}</p>
                      {(err.retryCount ?? 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Retries: {err.retryCount}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(err.id)}
                      disabled={isRetrying || err.status === 'in_progress'}
                      className="shrink-0 border-border text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Retry error ${err.id}`}
                    >
                      {isRetrying ? (
                        <span className="animate-pulse">Retrying…</span>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" aria-hidden />
                          Retry
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
