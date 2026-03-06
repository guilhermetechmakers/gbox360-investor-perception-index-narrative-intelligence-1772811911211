import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TopicAggregate } from '@/types/topic-persistence'
import { ensureArray } from '@/lib/runtime-safe'

interface PersistenceChartProps {
  data?: TopicAggregate[] | null
  height?: number
  className?: string
}

export function PersistenceChart({ data = [], height = 200, className }: PersistenceChartProps) {
  const safeData = ensureArray(data)
  const chartData = useMemo(() => {
    return safeData
      .slice(0, 10)
      .map((d) => ({
        name: d.topic_label,
        value: d.persistence_score,
        count: d.authority_weighted_count,
      }))
      .sort((a, b) => b.value - a.value)
  }, [safeData])

  if (chartData.length === 0) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl">Persistence by Topic</CardTitle>
          <p className="text-sm text-muted-foreground">No topic data for this window</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <TrendingUp className="h-10 w-10 opacity-50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">Persistence by Topic</CardTitle>
        <p className="text-sm text-muted-foreground">Time-decayed frequency with authority weighting</p>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="persistenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                stroke="rgb(var(--border))"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                stroke="rgb(var(--border))"
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, _name: string, props: { payload?: { count?: number } }) => [
                  `${value.toFixed(2)} (weighted: ${props?.payload?.count?.toFixed(1) ?? '—'})`,
                  'Persistence',
                ]}
                labelFormatter={(label) => `Topic: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                fill="url(#persistenceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
