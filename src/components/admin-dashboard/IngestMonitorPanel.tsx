import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Database, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IngestMonitorSource } from '@/api/admin-dashboard'

interface IngestMonitorPanelProps {
  sources?: IngestMonitorSource[]
  isLoading?: boolean
  /** Optional error message; when set, error state is shown */
  error?: string | null
  /** Callback for empty state CTA (e.g. refresh ingest metrics) */
  onRefresh?: () => void
  /** When true, empty state or refresh CTA shows loading */
  isRefreshing?: boolean
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

export function IngestMonitorPanel({
  sources = [],
  isLoading = false,
  error = null,
  onRefresh,
  isRefreshing = false,
}: IngestMonitorPanelProps) {
  const items = Array.isArray(sources) ? sources : []
  const hasError = Boolean(error && String(error).trim())

  return (
    <Card className="card-surface" aria-label="Ingest monitor">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" aria-hidden />
          Ingest monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading ingest metrics">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : hasError ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-border bg-muted/50"
            role="alert"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="text-sm font-medium text-foreground">Unable to load metrics</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
                className="mt-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={isRefreshing ? 'Retrying' : 'Try again'}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                    Retrying…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" aria-hidden />
                    Try again
                  </>
                )}
              </Button>
            )}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Database className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No source metrics available"
            description="Ingest source metrics and sparklines will appear here when data is available. Try refreshing to fetch the latest."
            action={
              onRefresh ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing}
                  className="bg-primary text-primary-foreground transition-shadow duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={isRefreshing ? 'Refreshing ingest metrics' : 'Refresh ingest metrics'}
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
          <div className="space-y-4" role="list" aria-label="Ingest source metrics">
            {items.map((s) => {
              const chartData = (s.sparklineData ?? []).map((v, i) => ({
                name: `T-${(s.sparklineData?.length ?? 0) - i}`,
                value: v,
              }))
              return (
                <div
                  key={s.id}
                  role="listitem"
                  className={cn(
                    'rounded-[10px] border border-border p-4 transition-all duration-200',
                    'hover:shadow-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>Rate: {s.rate ?? 0}/h</span>
                      <span>Queue: {s.queueSize ?? 0}</span>
                      <span>Errors: {s.errors ?? 0}</span>
                      <span>Last: {formatTime(s.lastFetch ?? s.lastRetry)}</span>
                    </div>
                  </div>
                  {chartData.length > 0 && (
                    <div className="h-12 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgb(var(--card))',
                              border: '1px solid rgb(var(--border))',
                              borderRadius: 'var(--radius)',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="rgb(var(--accent))"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
