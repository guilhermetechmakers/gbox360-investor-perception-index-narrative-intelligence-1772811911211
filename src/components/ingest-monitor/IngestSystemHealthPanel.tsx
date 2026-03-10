import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HealthComponent } from '@/types/ingest'

const STATUS_ICONS = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  unhealthy: XCircle,
}

const STATUS_COLORS = {
  healthy: 'text-success',
  degraded: 'text-accent',
  unhealthy: 'text-destructive',
}

interface IngestSystemHealthPanelProps {
  components: HealthComponent[]
  isLoading?: boolean
  /** Callback for empty state CTA (e.g. refresh system health) */
  onRefresh?: () => void
  /** When true, empty state CTA shows loading */
  isRefreshing?: boolean
}

export function IngestSystemHealthPanel({
  components = [],
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: IngestSystemHealthPanelProps) {
  const items = Array.isArray(components) ? components : []

  if (isLoading) {
    return (
      <Card
        className="card-surface transition-all duration-300"
        aria-label="Ingest system health panel"
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" aria-hidden />
            System health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="status"
            aria-busy="true"
            aria-label="Loading system health"
          >
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthyCount = items.filter((c) => c.status === 'healthy').length
  const totalCount = items.length || 1
  const healthScore = Math.round((healthyCount / totalCount) * 100)

  return (
    <Card
      className="card-surface transition-all duration-300"
      aria-label="Ingest system health panel"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" aria-hidden />
          System health
        </CardTitle>
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            healthScore >= 90 ? 'text-success' : healthScore >= 70 ? 'text-accent' : 'text-destructive'
          )}
          aria-label={`System health score: ${healthScore} percent`}
        >
          {healthScore}%
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No health data available"
            description="Health metrics for ingest components will appear here when data is available. Try refreshing to fetch the latest status."
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
                      <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                      Refreshing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" aria-hidden />
                      Refresh
                    </>
                  )}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2" role="list" aria-label="Health component status list">
            {items.map((c) => {
              const Icon = STATUS_ICONS[c.status] ?? CheckCircle
              const statusLabel = c.status ?? 'healthy'
              const componentName = c.component ?? 'Unknown'
              return (
                <div
                  key={c.id ?? c.component}
                  role="listitem"
                  aria-label={`${componentName}: ${statusLabel}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition-shadow duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn('h-4 w-4', STATUS_COLORS[c.status] ?? STATUS_COLORS.healthy)}
                      aria-hidden
                    />
                    <span className="font-medium">{c.component}</span>
                  </div>
                  <span
                    className={cn('text-sm', STATUS_COLORS[c.status] ?? STATUS_COLORS.healthy)}
                    aria-hidden
                  >
                    {c.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
