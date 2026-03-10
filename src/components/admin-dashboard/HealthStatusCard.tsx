/**
 * Health & ingest status summary from GET /admin/health and GET /admin/status/ingest.
 * Design: card with 10–12px radius, border, focus-visible ring per design system.
 * Uses design tokens only; loading/error states with retry; full accessibility.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Heart, Database, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminHealth, useAdminIngestStatus } from '@/hooks/useAdminDashboard'

export function HealthStatusCard() {
  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
    error: healthErr,
    refetch: refetchHealth,
  } = useAdminHealth(30000)
  const {
    data: ingestStatus,
    isLoading: ingestLoading,
    isError: ingestError,
    error: ingestErr,
    refetch: refetchIngest,
  } = useAdminIngestStatus(30000)

  const isLoading = healthLoading || ingestLoading
  const isError = healthError || ingestError
  const errorMessage =
    (healthError && healthErr instanceof Error ? healthErr.message : null) ??
    (ingestError && ingestErr instanceof Error ? ingestErr.message : null) ??
    'Failed to load health status.'

  const refetch = () => {
    refetchHealth()
    refetchIngest()
  }

  const status = health?.status ?? 'healthy'
  const dbLatency = health?.dbLatencyMs
  const sources = (ingestStatus?.sources ?? []) as {
    id: string
    name: string
    queueSize?: number
    throughput?: number
  }[]
  const lastUpdated = ingestStatus?.lastUpdated
  const hasContent =
    dbLatency != null || sources.length > 0 || (lastUpdated != null && lastUpdated !== '')

  return (
    <Card
      className="rounded-[10px] border border-border bg-card text-card-foreground shadow-card transition-all duration-200 hover:shadow-card-hover"
      aria-label="Health and ingest status"
      role="region"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Heart
            className="h-5 w-5 text-muted-foreground"
            aria-hidden
          />
          <span>Health & ingest status</span>
        </CardTitle>
        {!isLoading && !isError && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-0.5 rounded-md border border-transparent',
              status === 'healthy' && 'bg-success/20 text-success',
              status === 'degraded' && 'bg-accent/20 text-accent',
              status === 'unhealthy' && 'bg-destructive/20 text-destructive'
            )}
            aria-label={`System status: ${status}`}
            role="status"
          >
            {status}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Health status loading"
          >
            <p className="text-sm text-muted-foreground">Checking health…</p>
            <Skeleton className="h-10 w-full rounded-lg bg-muted" />
            <Skeleton className="h-16 w-full rounded-lg bg-muted" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2 border-border bg-background text-foreground hover:bg-muted"
              aria-label="Refresh health status"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </Button>
          </div>
        ) : isError ? (
          <div
            className="rounded-lg border border-border bg-muted/50 p-4 space-y-3"
            role="alert"
            aria-live="assertive"
            aria-label="Health status error"
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className="h-5 w-5 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">Unable to load status</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={refetch}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Try again to load health status"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : !hasContent && sources.length === 0 ? (
          <div
            className="rounded-lg border border-border bg-muted/30 p-6 text-center space-y-3"
            role="status"
            aria-label="No health or ingest data yet"
          >
            <Database
              className="h-10 w-10 mx-auto text-muted-foreground"
              aria-hidden
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground">
                Health and ingest sources will appear here once available.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2 border-border bg-background"
              aria-label="Refresh health status"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </Button>
          </div>
        ) : (
          <>
            {dbLatency != null && (
              <p className="text-sm text-muted-foreground">
                DB latency: <span className="font-medium text-foreground">{dbLatency}ms</span>
              </p>
            )}
            {sources.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Database
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  Ingest sources
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground" aria-label="Ingest sources list">
                  {sources.slice(0, 5).map((s) => (
                    <li key={s.id} className="flex justify-between gap-2">
                      <span>{s.name}</span>
                      <span className="tabular-nums">
                        queue: {s.queueSize ?? 0}
                        {s.throughput != null ? ` · ${s.throughput}/min` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 py-4 px-3 text-center">
                <p className="text-sm text-muted-foreground">No ingest sources configured</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={refetch}
                  className="mt-2 gap-2 text-muted-foreground hover:text-foreground"
                  aria-label="Refresh ingest status"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Refresh
                </Button>
              </div>
            )}
            {lastUpdated != null && lastUpdated !== '' && (
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
