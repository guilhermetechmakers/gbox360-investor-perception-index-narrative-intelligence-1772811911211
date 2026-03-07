import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'
import { ChevronDown, ChevronRight, Activity, ServerCog, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemQueue } from '@/types/admin'

interface SystemHealthPanelProps {
  queues?: SystemQueue[]
  healthScore?: number
  isLoading?: boolean
  /** When set, an error state is shown with optional retry CTA */
  error?: string | null
  /** Callback for empty state CTA (e.g. refresh system health) */
  onRefresh?: () => void
  /** Callback for error state retry */
  onRetry?: () => void
  /** When true, empty state CTA shows loading */
  isRefreshing?: boolean
}

export function SystemHealthPanel({
  queues = [],
  healthScore = 100,
  isLoading = false,
  error: errorMessage = null,
  onRefresh,
  onRetry,
  isRefreshing = false,
}: SystemHealthPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const items = Array.isArray(queues) ? queues : []
  const hasError = Boolean(errorMessage)

  return (
    <Card
      className="card-surface transition-all duration-300"
      aria-label="System health panel"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" aria-hidden />
          System health
        </CardTitle>
        {!isLoading && !hasError && (
          <span
            className={cn(
              'text-2xl font-bold tabular-nums',
              healthScore >= 90 ? 'text-success' : healthScore >= 70 ? 'text-accent' : 'text-destructive'
            )}
            aria-label={`System health score: ${healthScore} percent`}
          >
            {healthScore}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="space-y-3"
            role="status"
            aria-busy="true"
            aria-label="Loading system health"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : hasError ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
            title="Unable to load system health"
            description={errorMessage ?? 'Something went wrong. Try again.'}
            action={
              onRetry ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Retry loading system health"
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                  Retry
                </Button>
              ) : undefined
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ServerCog className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No queue data available"
            description="Queue metrics will appear here when system health data is available."
            action={
              onRefresh ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing}
                  className="bg-primary text-primary-foreground transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={isRefreshing ? 'Refreshing system health' : 'Refresh system health'}
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
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2" role="list">
            {items.map((q) => {
              const isExpanded = expandedId === q.id
              const hasIssues = (q.errorCount ?? 0) > 0 || (q.retryCount ?? 0) > 0
              const queueName = q.name ?? 'Unknown queue'
              return (
                <div
                  key={q.id}
                  role="listitem"
                  className={cn(
                    'rounded-lg border border-border bg-card transition-all duration-200',
                    'hover:shadow-card'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Collapse queue details for ${queueName}` : `Expand queue details for ${queueName}`}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{q.name}</span>
                      {hasIssues && (
                        <span className="text-xs text-accent">({q.errorCount ?? 0} errors)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Depth: <span className="font-medium text-foreground">{q.depth ?? 0}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Retries: <span className="font-medium text-foreground">{q.retryCount ?? 0}</span>
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                      <p>Last updated: {q.lastUpdated ? new Date(q.lastUpdated).toLocaleString() : '—'}</p>
                      <p>Error count: {q.errorCount ?? 0}</p>
                      <p>Retry count: {q.retryCount ?? 0}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
