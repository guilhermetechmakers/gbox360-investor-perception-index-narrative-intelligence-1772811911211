import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemQueue } from '@/types/admin'

interface SystemHealthPanelProps {
  queues?: SystemQueue[]
  healthScore?: number
  isLoading?: boolean
}

export function SystemHealthPanel({
  queues = [],
  healthScore = 100,
  isLoading = false,
}: SystemHealthPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const items = Array.isArray(queues) ? queues : []

  return (
    <Card className="card-surface transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          System health
        </CardTitle>
        {!isLoading && (
          <span
            className={cn(
              'text-2xl font-bold tabular-nums',
              healthScore >= 90 ? 'text-success' : healthScore >= 70 ? 'text-accent' : 'text-destructive'
            )}
          >
            {healthScore}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No queue data available.</p>
        ) : (
          <div className="space-y-2">
            {items.map((q) => {
              const isExpanded = expandedId === q.id
              const hasIssues = (q.errorCount ?? 0) > 0 || (q.retryCount ?? 0) > 0
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-lg border border-border bg-card transition-all duration-200',
                    'hover:shadow-card'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
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
