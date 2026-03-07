import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['rgb(var(--primary))', 'rgb(var(--accent))', 'rgb(var(--success))']

export interface IPIBreakdown {
  narrative: number
  credibility: number
  risk: number
}

interface IPISummaryPanelProps {
  ipiValue?: number | null
  direction?: 'up' | 'down' | 'flat'
  delta?: number
  topContributions?: Array<{ name: string; value: number }>
  breakdown?: IPIBreakdown | null
  timestamp?: string | null
}

export function IPISummaryPanel({
  ipiValue,
  direction = 'flat',
  delta = 0,
  topContributions = [],
  breakdown,
  timestamp,
}: IPISummaryPanelProps) {
  const hasData = ipiValue != null && typeof ipiValue === 'number'
  const safeContributions = Array.isArray(topContributions) ? topContributions : []
  const b = breakdown ?? { narrative: 0.4, credibility: 0.4, risk: 0.2 }

  const pieData = [
    { name: 'Narrative', value: (b.narrative ?? 0.4) * 100, color: COLORS[0] },
    { name: 'Credibility', value: (b.credibility ?? 0.4) * 100, color: COLORS[1] },
    { name: 'Risk', value: (b.risk ?? 0.2) * 100, color: COLORS[2] },
  ]

  const DirectionIcon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  if (!hasData) {
    return (
      <Card className="card-surface" aria-label="IPI Summary - no data">
        <CardHeader>
          <CardTitle className="text-xl">IPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-label="No IPI data for selected window">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
            <p className="text-muted-foreground">No data for the selected window</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different time range or company
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl">IPI Summary</CardTitle>
        {timestamp && (
          <p className="text-sm text-muted-foreground">As of {timestamp}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold tabular-nums">
            {ipiValue.toFixed(2)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
              direction === 'up' && 'bg-success/20 text-success',
              direction === 'down' && 'bg-destructive/20 text-destructive',
              direction === 'flat' && 'bg-muted text-muted-foreground'
            )}
          >
            <DirectionIcon className="h-4 w-4" />
            {direction !== 'flat'
              ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`
              : 'No change'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {pieData.map((d) => (
            <span
              key={d.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name}: {(d.value).toFixed(0)}%
            </span>
          ))}
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(0)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {safeContributions.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Top contributions
            </p>
            <div className="space-y-1">
              {safeContributions.slice(0, 3).map((c) => (
                <div
                  key={c.name}
                  className="flex justify-between text-sm"
                >
                  <span>{c.name}</span>
                  <span className="font-medium">{(c.value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
