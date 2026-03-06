/**
 * Health & ingest status summary from GET /admin/health and GET /admin/status/ingest.
 * Design: card with 10–12px radius, border, focus-visible ring per design system.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminHealth, useAdminIngestStatus } from '@/hooks/useAdminDashboard'

export function HealthStatusCard() {
  const { data: health, isLoading: healthLoading } = useAdminHealth(30000)
  const { data: ingestStatus, isLoading: ingestLoading } = useAdminIngestStatus(30000)

  const isLoading = healthLoading || ingestLoading
  const status = health?.status ?? 'healthy'
  const dbLatency = health?.dbLatencyMs
  const sources = (ingestStatus?.sources ?? []) as { id: string; name: string; queueSize?: number; throughput?: number }[]
  const lastUpdated = ingestStatus?.lastUpdated

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-muted-foreground" />
          Health & ingest status
        </CardTitle>
        {!isLoading && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-0.5 rounded-md',
              status === 'healthy' && 'bg-success/20 text-success',
              status === 'degraded' && 'bg-accent/20 text-accent',
              status === 'unhealthy' && 'bg-destructive/20 text-destructive'
            )}
          >
            {status}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {dbLatency != null && (
              <p className="text-sm text-muted-foreground">
                DB latency: <span className="font-medium text-foreground">{dbLatency}ms</span>
              </p>
            )}
            {sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Ingest sources
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
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
            )}
            {lastUpdated && (
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
