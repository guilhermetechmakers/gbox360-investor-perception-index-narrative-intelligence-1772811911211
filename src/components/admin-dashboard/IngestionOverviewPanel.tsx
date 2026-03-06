import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Rss, Twitter, FileText, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IngestionSource } from '@/types/admin'

const SOURCE_ICONS: Record<string, typeof Rss> = {
  news: Rss,
  newsapi: Rss,
  social: Twitter,
  twitter: Twitter,
  transcript: FileText,
  earnings: FileText,
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return d.toLocaleDateString()
}

interface IngestionOverviewPanelProps {
  sources: IngestionSource[]
  isLoading?: boolean
  sourceFilter?: string
  onSourceFilterChange?: (v: string) => void
  timeWindow?: string
  onTimeWindowChange?: (v: string) => void
}

export function IngestionOverviewPanel({
  sources = [],
  isLoading = false,
  sourceFilter = 'all',
  onSourceFilterChange,
  timeWindow = '24h',
  onTimeWindowChange,
}: IngestionOverviewPanelProps) {
  const allItems = Array.isArray(sources) ? sources : []
  const items =
    sourceFilter && sourceFilter !== 'all'
      ? allItems.filter((s) => s.id === sourceFilter || s.name === sourceFilter)
      : allItems

  return (
    <Card className="card-surface transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Ingestion status</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {items.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeWindow} onValueChange={onTimeWindowChange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="Window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ingestion sources configured.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => {
              const Icon = SOURCE_ICONS[s.id] ?? Rss
              const hasWarnings = (s.rateLimitWarnings ?? []).length > 0
              const statusVariant =
                s.status === 'error'
                  ? 'destructive'
                  : s.status === 'degraded'
                    ? 'accent'
                    : 'success'
              return (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-lg border border-border bg-card p-4 transition-all duration-200',
                    'hover:shadow-card-hover hover:-translate-y-0.5'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <Badge variant={statusVariant} className="text-xs">
                      {s.status}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Last ingest: {formatRelativeTime(s.lastIngestTime)}
                    </p>
                    <p className="font-medium">
                      {s.throughput ?? 0} items · {(s.errorCount ?? 0)} errors
                    </p>
                    {hasWarnings && (
                      <div className="flex items-center gap-1 text-accent">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">
                          {(s.rateLimitWarnings ?? []).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
