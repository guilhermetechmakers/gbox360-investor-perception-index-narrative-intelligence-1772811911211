import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScorePill } from '@/components/signals/ScorePill'
import { Sparkline } from '@/components/dashboard/Sparkline'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Movement } from '@/types/drilldown'

interface NarrativeHeaderCardProps {
  movement: Movement | null | undefined
  isLoading?: boolean
  sparklineData?: number[]
  /** Aggregated credibility score 0–1 from events */
  credibilityScore?: number | null
  /** Aggregated risk score 0–1 from events */
  riskScore?: number | null
}

export function NarrativeHeaderCard({
  movement,
  isLoading,
  sparklineData = [],
  credibilityScore,
  riskScore,
}: NarrativeHeaderCardProps) {
  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const title = movement?.narrativeTitle ?? 'Narrative'
  const persistence = movement?.persistenceScore ?? 0
  const contribution = movement?.contributionDelta ?? 0
  const safeSparkline = Array.isArray(sparklineData) ? sparklineData : []
  const cred = movement?.credibilityScore ?? credibilityScore ?? null
  const risk = movement?.riskScore ?? riskScore ?? null

  const trendIcon =
    contribution > 0 ? (
      <TrendingUp className="h-4 w-4 text-success" aria-hidden />
    ) : contribution < 0 ? (
      <TrendingDown className="h-4 w-4 text-destructive" aria-hidden />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" aria-hidden />
    )

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Persistence and contribution to IPI movement
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Persistence</span>
            <Badge variant="accent" className="text-sm font-semibold">
              {(persistence * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Contribution</span>
            <span
              className={cn(
                'flex items-center gap-1 text-lg font-bold',
                contribution > 0 && 'text-success',
                contribution < 0 && 'text-destructive'
              )}
            >
              {trendIcon}
              {contribution > 0 ? '+' : ''}
              {(contribution * 100).toFixed(1)}%
            </span>
          </div>
          {safeSparkline.length >= 2 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trend</span>
              <div className="w-24">
                <Sparkline data={safeSparkline} height={28} />
              </div>
            </div>
          )}
          {cred != null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Credibility</span>
              <ScorePill score={cred} variant="credibility" size="sm" showLabel={false} />
            </div>
          )}
          {risk != null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Risk</span>
              <ScorePill score={risk} variant="risk" size="sm" showLabel={false} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
