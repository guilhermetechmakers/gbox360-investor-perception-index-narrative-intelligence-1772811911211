import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkline } from '@/components/dashboard/Sparkline'
import { Rss, Twitter, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  news: Rss,
  social: Twitter,
  transcript: FileText,
}

function formatTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface SourceTileProps {
  sourceId: string
  name: string
  metrics: {
    lastFetch?: string
    itemsProcessed: number
    errors: number
    retryCount: number
    rateLimitUsed: number
    rateLimitTotal: number
  }
  status?: 'healthy' | 'degraded' | 'unhealthy'
  sparklineData?: number[]
  isLoading?: boolean
}

export function SourceTile({
  sourceId,
  name,
  metrics,
  status = 'healthy',
  sparklineData = [],
  isLoading = false,
}: SourceTileProps) {
  const Icon = SOURCE_ICONS[sourceId] ?? FileText
  const ratePct =
    (metrics.rateLimitTotal ?? 0) > 0
      ? Math.min(100, ((metrics.rateLimitUsed ?? 0) / metrics.rateLimitTotal) * 100)
      : 0

  if (isLoading) {
    return (
      <Card
        className="card-surface"
        aria-busy="true"
        aria-label="Source loading"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Loader2
              className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Loading source…
          </p>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const statusLabel =
    status === 'unhealthy' ? 'Error' : status === 'degraded' ? 'Degraded' : 'OK'
  const cardAriaLabel = `Source ${name}, status ${statusLabel}, ${metrics.itemsProcessed ?? 0} items processed`

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-200',
        'hover:shadow-card-hover hover:-translate-y-0.5'
      )}
      aria-label={cardAriaLabel}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          {name}
        </CardTitle>
        <Badge
          variant={
            status === 'unhealthy'
              ? 'destructive'
              : status === 'degraded'
                ? 'accent'
                : 'success'
          }
          aria-label={`Status: ${statusLabel}`}
        >
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm" role="group" aria-label="Source metrics">
          <span className="text-muted-foreground">
            Items: <span className="font-semibold text-foreground">{metrics.itemsProcessed ?? 0}</span>
          </span>
          <span className="text-muted-foreground">
            Errors: <span className="font-semibold text-foreground">{metrics.errors ?? 0}</span>
          </span>
          <span className="text-muted-foreground">
            Retries: <span className="font-semibold text-foreground">{metrics.retryCount ?? 0}</span>
          </span>
          <span className="text-muted-foreground">
            Last: <span className="font-medium text-foreground">{formatTime(metrics.lastFetch)}</span>
          </span>
        </div>
        {(metrics.rateLimitTotal ?? 0) > 0 && (
          <div className="space-y-1" role="group" aria-label={`Rate limit ${metrics.rateLimitUsed ?? 0} of ${metrics.rateLimitTotal} used`}>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rate limit</span>
              <span>
                {metrics.rateLimitUsed ?? 0} / {metrics.rateLimitTotal}
              </span>
            </div>
            <Progress
              value={ratePct}
              className="h-1.5 bg-muted"
              aria-valuenow={Math.round(ratePct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Rate limit usage"
            />
          </div>
        )}
        {Array.isArray(sparklineData) && sparklineData.length >= 2 && (
          <div className="h-8" aria-label="Activity sparkline">
            <Sparkline data={sparklineData} height={32} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
