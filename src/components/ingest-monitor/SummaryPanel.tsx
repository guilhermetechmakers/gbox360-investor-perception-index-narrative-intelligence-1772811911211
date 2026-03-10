import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, AlertTriangle, RotateCcw, Clock, RefreshCw, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SummaryStats } from '@/types/ingest'

interface SummaryPanelProps {
  /** Summary stats; when null/undefined, empty state is shown */
  stats?: SummaryStats | null
  isLoading?: boolean
  /** Called when user clicks Refresh; when provided, a refresh button is shown */
  onRefresh?: () => void | Promise<unknown>
  /** When true, the refresh button shows a loading state (e.g. during refetch) */
  isRefreshing?: boolean
}

function formatMs(ms?: number): string {
  if (ms == null || ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function isEmptyStats(stats: SummaryStats | null | undefined): boolean {
  if (stats == null) return true
  return (
    (stats.totalQueueItems ?? 0) === 0 &&
    (stats.totalErrors ?? 0) === 0 &&
    (stats.totalRetries ?? 0) === 0 &&
    (stats.avgProcessingTimeMs ?? 0) === 0
  )
}

export function SummaryPanel({
  stats,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: SummaryPanelProps) {
  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasStats = stats != null && !isEmptyStats(stats)

  if (!hasStats) {
    return (
      <Card className="card-surface" aria-label="Summary - no data">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Summary</CardTitle>
          {typeof onRefresh === 'function' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-ring"
              aria-label={isRefreshing ? 'Refreshing summary' : 'Refresh summary'}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              <span className="sr-only sm:not-sr-only sm:ml-2">
                {isRefreshing ? 'Refreshing…' : 'Refresh'}
              </span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center py-12 text-center animate-fade-in"
            role="status"
            aria-label="No summary data available"
          >
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
            <p className="text-muted-foreground font-medium">No summary data available</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Ingest metrics have not been loaded yet or no sources are configured. Use Refresh to
              try again.
            </p>
            {typeof onRefresh === 'function' && (
              <Button
                variant="default"
                size="sm"
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-ring"
                onClick={() => onRefresh()}
                disabled={isRefreshing}
                aria-label={isRefreshing ? 'Refreshing' : 'Try again'}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {isRefreshing ? 'Refreshing…' : 'Try again'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const items = [
    {
      label: 'Queue items',
      value: stats.totalQueueItems ?? 0,
      icon: BarChart3,
    },
    {
      label: 'Total errors',
      value: stats.totalErrors ?? 0,
      icon: AlertTriangle,
    },
    {
      label: 'Total retries',
      value: stats.totalRetries ?? 0,
      icon: RotateCcw,
    },
    {
      label: 'Avg processing',
      value: formatMs(stats.avgProcessingTimeMs),
      icon: Clock,
    },
  ]

  return (
    <Card className="card-surface transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Summary</CardTitle>
        {typeof onRefresh === 'function' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh()}
            disabled={isRefreshing}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-ring border-border"
            aria-label={isRefreshing ? 'Refreshing summary' : 'Refresh summary'}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(items ?? []).map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={cn(
                  'rounded-lg border border-border bg-card p-4 transition-all duration-200',
                  'hover:shadow-card hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                )}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString()
                    : item.value}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
