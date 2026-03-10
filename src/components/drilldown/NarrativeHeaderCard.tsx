import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScorePill } from '@/components/signals/ScorePill'
import { Sparkline } from '@/components/dashboard/Sparkline'
import { EmptyState } from '@/components/profile/EmptyState'
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react'
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
  /** When true, show error state with optional retry */
  isError?: boolean
  /** Error instance for message display */
  error?: Error | null
  /** Callback to retry loading narrative data */
  onRetry?: () => void
}

const CARD_RADIUS = 'rounded-[10px]'
const CARD_BORDER = 'border border-border'
const CARD_SHADOW = 'shadow-card hover:shadow-card-hover'
const CARD_TRANSITION = 'transition-all duration-200 hover:-translate-y-0.5'

export function NarrativeHeaderCard({
  movement,
  isLoading,
  sparklineData = [],
  credibilityScore,
  riskScore,
  isError = false,
  error,
  onRetry,
}: NarrativeHeaderCardProps) {
  if (isLoading) {
    return (
      <Card
        className={cn('card-surface', CARD_RADIUS, CARD_BORDER, CARD_SHADOW, CARD_TRANSITION)}
        role="region"
        aria-busy="true"
        aria-label="Loading narrative summary"
      >
        <CardHeader>
          <Skeleton className="h-8 w-64 bg-muted" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Loading narrative summary…
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-24 rounded-full bg-muted" />
            <Skeleton className="h-10 w-24 rounded-full bg-muted" />
          </div>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
                aria-label="Retry loading narrative summary"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card
        className={cn('card-surface', CARD_RADIUS, CARD_BORDER, CARD_SHADOW, CARD_TRANSITION)}
        role="region"
        aria-label="Narrative summary error"
      >
        <CardContent className="p-6">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
            title="Couldn't load narrative"
            description={error?.message ?? 'Something went wrong while loading this narrative. Check your connection and try again.'}
            action={
              onRetry ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="gap-2"
                  aria-label="Retry loading narrative"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Try again
                </Button>
              ) : null
            }
            className="min-h-[160px]"
          />
        </CardContent>
      </Card>
    )
  }

  if (!movement) {
    return (
      <Card
        className={cn('card-surface', CARD_RADIUS, CARD_BORDER, CARD_SHADOW, CARD_TRANSITION)}
        role="region"
        aria-label="No narrative selected"
      >
        <CardContent className="p-6">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No narrative selected"
            description="Select a narrative from the company view or overview to see persistence, contribution, and trend here."
            className="min-h-[140px]"
          />
        </CardContent>
      </Card>
    )
  }

  const title = movement?.narrativeTitle ?? 'Narrative'
  const titleId = 'narrative-header-title'
  const descId = 'narrative-header-desc'
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

  const persistenceLabel = `Persistence score: ${(persistence * 100).toFixed(0)}%`
  const contributionLabel = `Contribution to IPI: ${contribution > 0 ? '+' : ''}${(contribution * 100).toFixed(1)}%`
  const trendLabel = 'Trend sparkline'

  return (
    <Card
      className={cn('card-surface', CARD_RADIUS, CARD_BORDER, CARD_SHADOW, CARD_TRANSITION)}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-label="Narrative summary"
    >
      <CardHeader>
        <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p id={descId} className="text-sm text-muted-foreground">
          Persistence and contribution to IPI movement
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-wrap items-center gap-6"
          role="group"
          aria-label="Narrative metrics"
        >
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={persistenceLabel}
          >
            <span className="text-sm text-muted-foreground">Persistence</span>
            <Badge
              variant="accent"
              className="text-sm font-semibold text-accent-foreground"
              aria-hidden
            >
              {(persistence * 100).toFixed(0)}%
            </Badge>
          </div>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label={contributionLabel}
          >
            <span className="text-sm text-muted-foreground">Contribution</span>
            <span
              className={cn(
                'flex items-center gap-1 text-lg font-bold text-foreground',
                contribution > 0 && 'text-success',
                contribution < 0 && 'text-destructive'
              )}
              aria-hidden
            >
              {trendIcon}
              {contribution > 0 ? '+' : ''}
              {(contribution * 100).toFixed(1)}%
            </span>
          </div>
          {safeSparkline.length >= 2 && (
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label={trendLabel}
            >
              <span className="text-sm text-muted-foreground">Trend</span>
              <div className="w-24" aria-hidden>
                <Sparkline data={safeSparkline} height={28} />
              </div>
            </div>
          )}
          {cred != null && (
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label={cred != null ? `Credibility score: ${(cred * 100).toFixed(0)}%` : undefined}
            >
              <span className="text-sm text-muted-foreground">Credibility</span>
              <ScorePill
                score={cred}
                variant="credibility"
                size="sm"
                showLabel={false}
                label="Credibility"
              />
            </div>
          )}
          {risk != null && (
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label={risk != null ? `Risk score: ${(risk * 100).toFixed(0)}%` : undefined}
            >
              <span className="text-sm text-muted-foreground">Risk</span>
              <ScorePill
                score={risk}
                variant="risk"
                size="sm"
                showLabel={false}
                label="Risk"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
