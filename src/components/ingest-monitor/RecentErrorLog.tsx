import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RotateCcw } from 'lucide-react'
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
}

export function RecentErrorLog({
  errors = [],
  onRetry,
  isLoading = false,
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Recent error log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          Recent error log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No recent errors.</p>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
              {items.map((err) => {
                const isRetrying = retryingId === err.id
                return (
                  <div
                    key={err.id}
                    className={cn(
                      'flex items-start justify-between gap-4 rounded-lg border border-border p-3',
                      'transition-all duration-200 hover:shadow-card'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(err.timestamp ?? '')} · Source: {err.sourceId ?? '—'}
                      </p>
                      <p className="text-sm font-medium mt-0.5 line-clamp-2">{err.message ?? 'Unknown error'}</p>
                      {(err.retryCount ?? 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Retries: {err.retryCount}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(err.id)}
                      disabled={isRetrying || err.status === 'in_progress'}
                      className="shrink-0"
                      aria-label={`Retry error ${err.id}`}
                    >
                      {isRetrying ? (
                        <span className="animate-pulse">Retrying…</span>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
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
