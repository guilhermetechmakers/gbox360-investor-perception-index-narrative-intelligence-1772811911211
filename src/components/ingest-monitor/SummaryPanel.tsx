import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, AlertTriangle, RotateCcw, Clock } from 'lucide-react'
import type { SummaryStats } from '@/types/ingest'

interface SummaryPanelProps {
  stats: SummaryStats
  isLoading?: boolean
}

function formatMs(ms?: number): string {
  if (ms == null || ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function SummaryPanel({
  stats,
  isLoading = false,
}: SummaryPanelProps) {
  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
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
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-card"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
