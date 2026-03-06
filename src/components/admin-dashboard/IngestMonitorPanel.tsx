import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Database } from 'lucide-react'
import type { IngestMonitorSource } from '@/api/admin-dashboard'

interface IngestMonitorPanelProps {
  sources?: IngestMonitorSource[]
  isLoading?: boolean
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
}: IngestMonitorPanelProps) {
  const items = Array.isArray(sources) ? sources : []

  return (
    <Card className="card-surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          Ingest monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No source metrics available.</p>
        ) : (
          <div className="space-y-4">
            {items.map((s) => {
              const chartData = (s.sparklineData ?? []).map((v, i) => ({
                name: `T-${(s.sparklineData?.length ?? 0) - i}`,
                value: v,
              }))
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.name}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                              borderRadius: '8px',
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
