import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkline } from './Sparkline'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IPISnapshot } from '@/types/narrative'

interface IPIQuickCardProps {
  snapshot: IPISnapshot
  windowStart: string
  windowEnd: string
}

function DirectionBadge({
  direction,
  change,
}: {
  direction: 'up' | 'down' | 'flat'
  change: number
}) {
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        direction === 'up' && 'bg-success/20 text-success',
        direction === 'down' && 'bg-destructive/20 text-destructive',
        direction === 'flat' && 'bg-muted text-muted-foreground'
      )}
    >
      <Icon className="h-3 w-3" />
      {direction !== 'flat' ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '—'}
    </span>
  )
}

export const IPIQuickCard = memo(function IPIQuickCard({
  snapshot,
  windowStart,
  windowEnd,
}: IPIQuickCardProps) {
  const topNarratives = snapshot.top_narratives ?? []
  const sparklineData =
    topNarratives.length > 0
      ? topNarratives.map((n) => n.persistence ?? 0)
      : [snapshot.score * 0.9, snapshot.score * 0.95, snapshot.score]

  return (
    <Card className="group transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg truncate">{snapshot.company_name}</CardTitle>
          <DirectionBadge direction={snapshot.direction} change={snapshot.percent_change} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">
            {typeof snapshot.score === 'number' ? snapshot.score.toFixed(2) : '—'}
          </span>
          <span className="text-muted-foreground text-sm">IPI</span>
        </div>
        <Sparkline data={sparklineData} height={36} />
        {topNarratives.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topNarratives.slice(0, 3).map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent"
              >
                {n.label}
              </span>
            ))}
          </div>
        )}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full mt-2 transition-transform duration-200 group-hover:scale-[1.02]"
        >
          <Link
            to={`/dashboard/company/${snapshot.company_id}?start=${windowStart}&end=${windowEnd}`}
          >
            View details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
})
