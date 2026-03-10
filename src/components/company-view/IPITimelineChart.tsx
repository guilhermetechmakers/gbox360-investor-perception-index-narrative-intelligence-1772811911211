import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, RefreshCw, BarChart3 } from 'lucide-react'
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
  /** When true, shows skeleton loading state instead of chart or empty state */
  isLoading?: boolean
  /** Optional error message; when set with onRetry, shows error state */
  error?: string | null
  /** Called when user taps retry in error state */
  onRetry?: () => void
  /** Called when user taps CTA in empty state (e.g. change time window) */
  onEmptyAction?: () => void
  /** Label for the empty state CTA button */
  emptyStateActionLabel?: string
}

/** Lightweight IPI-over-time chart for Company View */
export function IPITimelineChart({
  data = [],
  currentScore,
  height = 200,
  className,
  isLoading = false,
  error = null,
  onRetry,
  onEmptyAction,
  emptyStateActionLabel = 'Change time window',
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

  const hasError = Boolean(error)
  const showEmpty = !isLoading && !hasError && chartData.length === 0

  if (isLoading) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">IPI Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">Score trend in selected window</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-24 rounded-md bg-muted" />
          <div style={{ height }} className="w-full space-y-2">
            <Skeleton className="h-full w-full rounded-lg bg-muted" />
            <div className="flex justify-between gap-2">
              <Skeleton className="h-3 w-12 rounded bg-muted" />
              <Skeleton className="h-3 w-12 rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError && onRetry) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">IPI Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">Score trend in selected window</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Retry loading IPI timeline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showEmpty) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">IPI Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">No timeline data for this window</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="flex items-center justify-center text-muted-foreground">
              <TrendingUp className="h-10 w-10 opacity-50" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Select a time window with IPI data to see the score trend.
            </p>
            {onEmptyAction && (
              <Button
                variant="default"
                size="sm"
                onClick={onEmptyAction}
                className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-ring"
                aria-label={emptyStateActionLabel}
              >
                {emptyStateActionLabel}
              </Button>
            )}
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
        <CardTitle className="text-xl text-foreground">IPI Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">Score trend in selected window</p>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(var(--border))"
                opacity={0.5}
              />
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
                  borderRadius: 'var(--radius)',
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
