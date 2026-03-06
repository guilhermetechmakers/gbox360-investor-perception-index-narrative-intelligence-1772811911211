import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IPITimelinePoint {
  date: string
  value: number
}

interface IPITimelineChartProps {
  data?: IPITimelinePoint[] | null
  currentScore?: number | null
  height?: number
  className?: string
}

/** Lightweight IPI-over-time chart for Company View */
export function IPITimelineChart({
  data = [],
  currentScore,
  height = 200,
  className,
}: IPITimelineChartProps) {
  const safeData = Array.isArray(data) ? data : []
  const chartData = useMemo(() => {
    if (safeData.length > 0) return safeData
    if (typeof currentScore === 'number') {
      return [
        { date: 'Start', value: Math.max(0, currentScore - 0.1) },
        { date: 'End', value: currentScore },
      ]
    }
    return []
  }, [safeData, currentScore])

  if (chartData.length === 0) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl">IPI Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">No timeline data for this window</p>
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
        <CardTitle className="text-xl">IPI Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">Score trend in selected window</p>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                stroke="rgb(var(--border))"
              />
              <YAxis
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
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
                formatter={(value: number) => [value.toFixed(2), 'IPI']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'rgb(var(--accent))', r: 3 }}
                activeDot={{ r: 5, fill: 'rgb(var(--accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
