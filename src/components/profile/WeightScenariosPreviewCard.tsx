import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettingsWeights } from '@/hooks/useSettings'
import { DEFAULT_WEIGHTS } from '@/types/settings'
import { ProvisionalWeightPreview } from './ProvisionalWeightPreview'
import { BarChart3, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function computePreviewIPI(
  n: number,
  c: number,
  r: number
): { score: number; delta: number } {
  const baseScore = 65
  const score = Math.round(
    baseScore * (0.4 * (n / 100) + 0.4 * (c / 100) + 0.2 * (1 - r / 100))
  )
  const prevScore = Math.round(baseScore * (0.4 * 0.4 + 0.4 * 0.4 + 0.2 * 0.8))
  return { score: Math.min(100, Math.max(0, score)), delta: score - prevScore }
}

export function WeightScenariosPreviewCard() {
  const { data: weightsData, isLoading } = useSettingsWeights()
  const [modalOpen, setModalOpen] = useState(false)

  const narrative = weightsData?.narrative ?? DEFAULT_WEIGHTS.narrative
  const credibility = weightsData?.credibility ?? DEFAULT_WEIGHTS.credibility
  const risk = weightsData?.risk ?? DEFAULT_WEIGHTS.risk

  const preview = useMemo(
    () => computePreviewIPI(narrative, credibility, risk),
    [narrative, credibility, risk]
  )

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-accent" />
              Weight scenarios preview
            </CardTitle>
            <Badge variant="accent" className="text-xs">
              Provisional
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Current IPI weight composition and impact
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums">{preview.score}</span>
            <span className="text-muted-foreground">/ 100</span>
            {preview.delta !== 0 && (
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  preview.delta > 0 ? 'text-success' : 'text-destructive'
                )}
              >
                {preview.delta > 0 ? (
                  <TrendingUp className="h-4 w-4" aria-hidden />
                ) : (
                  <TrendingDown className="h-4 w-4" aria-hidden />
                )}
                {preview.delta > 0 ? '+' : ''}
                {preview.delta} vs default
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-muted-foreground">Narrative</p>
              <p className="font-semibold">{narrative}%</p>
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-muted-foreground">Credibility</p>
              <p className="font-semibold">{credibility}%</p>
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-muted-foreground">Risk</p>
              <p className="font-semibold">{risk}%</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 transition-all duration-200 hover:scale-[1.01]"
            onClick={() => setModalOpen(true)}
          >
            What changed?
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <ProvisionalWeightPreview open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
