import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/profile/EmptyState'
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

/** Chart segment colors from design tokens (primary, accent, success) */
const CHART_COLORS = [
  'rgb(var(--primary))',
  'rgb(var(--accent))',
  'rgb(var(--success))',
]

/** Consistent icon size for inline indicators */
const ICON_SIZE_SM = 'h-4 w-4'
/** Consistent icon size for empty state (matches EmptyState usage across app) */
const ICON_SIZE_EMPTY = 'h-6 w-6'

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
  /** Optional callback for empty state CTA (e.g. scroll to time range / company selector) */
  onEmptyStateCta?: () => void
  /** Label for empty state CTA button */
  emptyStateCtaLabel?: string
}

export function IPISummaryPanel({
  ipiValue,
  direction = 'flat',
  delta = 0,
  topContributions = [],
  breakdown,
  timestamp,
  onEmptyStateCta,
  emptyStateCtaLabel = 'Change time range or company',
}: IPISummaryPanelProps) {
  const hasData = ipiValue != null && typeof ipiValue === 'number'
  const safeContributions = Array.isArray(topContributions) ? topContributions : []
  const b = breakdown ?? { narrative: 0.4, credibility: 0.4, risk: 0.2 }

  const pieData = [
    { name: 'Narrative', value: (b.narrative ?? 0.4) * 100, color: CHART_COLORS[0] },
    { name: 'Credibility', value: (b.credibility ?? 0.4) * 100, color: CHART_COLORS[1] },
    { name: 'Risk', value: (b.risk ?? 0.2) * 100, color: CHART_COLORS[2] },
  ]

  const DirectionIcon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  if (!hasData) {
    const handleEmptyCta = () => {
      if (onEmptyStateCta) {
        onEmptyStateCta()
        return
      }
      document.getElementById('company-main')?.scrollIntoView({ behavior: 'smooth' })
    }
    return (
      <Card className="card-surface" aria-label="IPI Summary - no data">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">IPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={
              <BarChart3
                className={cn(ICON_SIZE_EMPTY, 'text-muted-foreground')}
                aria-hidden
              />
            }
            title="No data for the selected window"
            description="Try a different time range or company."
            action={
              <Button
                variant="default"
                size="default"
                onClick={handleEmptyCta}
                className="min-h-[44px] px-6 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={emptyStateCtaLabel}
              >
                {emptyStateCtaLabel}
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">IPI Summary</CardTitle>
        {timestamp && (
          <p className="text-sm text-muted-foreground">As of {timestamp}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold tabular-nums text-foreground">
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
            <DirectionIcon className={ICON_SIZE_SM} aria-hidden />
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
