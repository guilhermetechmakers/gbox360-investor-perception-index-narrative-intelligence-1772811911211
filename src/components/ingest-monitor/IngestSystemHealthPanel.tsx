import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
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
}

export function IngestSystemHealthPanel({
  components = [],
  isLoading = false,
}: IngestSystemHealthPanelProps) {
  const items = Array.isArray(components) ? components : []

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            System health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const healthyCount = items.filter((c) => c.status === 'healthy').length
  const totalCount = items.length || 1
  const healthScore = Math.round((healthyCount / totalCount) * 100)

  return (
    <Card className="card-surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          System health
        </CardTitle>
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            healthScore >= 90 ? 'text-success' : healthScore >= 70 ? 'text-accent' : 'text-destructive'
          )}
        >
          {healthScore}%
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No health data available.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => {
              const Icon = STATUS_ICONS[c.status] ?? CheckCircle
              return (
                <div
                  key={c.id ?? c.component}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', STATUS_COLORS[c.status] ?? STATUS_COLORS.healthy)} />
                    <span className="font-medium">{c.component}</span>
                  </div>
                  <span className={cn('text-sm', STATUS_COLORS[c.status] ?? STATUS_COLORS.healthy)}>
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
