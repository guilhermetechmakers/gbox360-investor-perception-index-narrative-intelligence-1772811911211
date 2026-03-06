import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  useSettingsWeights,
  useUpdateSettingsWeights,
} from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_WEIGHTS } from '@/types/settings'
import { Info, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_NARRATIVE = 40
const DEFAULT_CREDIBILITY = 40
const DEFAULT_RISK = 20

/** Compute a sample provisional IPI from weights (for preview only) */
function computePreviewIPI(
  narrative: number,
  credibility: number,
  risk: number
): { score: number; delta: number } {
  const n = narrative / 100
  const c = credibility / 100
  const r = risk / 100
  const baseScore = 65
  const score = Math.round(baseScore * (0.4 * n + 0.4 * c + 0.2 * (1 - r)))
  const prevScore = Math.round(baseScore * (0.4 * 0.4 + 0.4 * 0.4 + 0.2 * 0.8))
  const delta = score - prevScore
  return { score: Math.min(100, Math.max(0, score)), delta }
}

export function ProvisionalWeightPanel() {
  const { data: weightsData, isLoading } = useSettingsWeights()
  const updateWeights = useUpdateSettingsWeights()
  const [scenario, setScenario] = useState<'default' | 'custom'>('default')
  const [narrativeWeight, setNarrativeWeight] = useState(DEFAULT_NARRATIVE)
  const [credibilityWeight, setCredibilityWeight] = useState(DEFAULT_CREDIBILITY)
  const [riskWeight, setRiskWeight] = useState(DEFAULT_RISK)

  useEffect(() => {
    if (weightsData) {
      const isCustom = weightsData.isCustom ?? false
      setScenario(isCustom ? 'custom' : 'default')
      setNarrativeWeight(weightsData.narrative ?? DEFAULT_NARRATIVE)
      setCredibilityWeight(weightsData.credibility ?? DEFAULT_CREDIBILITY)
      setRiskWeight(weightsData.risk ?? DEFAULT_RISK)
    }
  }, [weightsData])

  const total = narrativeWeight + credibilityWeight + riskWeight
  const normalized = useMemo(() => {
    if (total === 0) return { n: 0, c: 0, r: 0 }
    return {
      n: (narrativeWeight / total) * 100,
      c: (credibilityWeight / total) * 100,
      r: (riskWeight / total) * 100,
    }
  }, [narrativeWeight, credibilityWeight, riskWeight, total])

  const preview = useMemo(
    () => computePreviewIPI(normalized.n, normalized.c, normalized.r),
    [normalized]
  )

  const handleSliderChange = (
    type: 'narrative' | 'credibility' | 'risk',
    value: number
  ) => {
    if (type === 'narrative') {
      setNarrativeWeight(value)
      const remainder = 100 - value - riskWeight
      setCredibilityWeight(Math.max(0, Math.min(80, remainder)))
    } else if (type === 'credibility') {
      setCredibilityWeight(value)
      const remainder = 100 - narrativeWeight - value
      setRiskWeight(Math.max(0, Math.min(50, remainder)))
    } else {
      setRiskWeight(value)
      const remainder = 100 - narrativeWeight - value
      setCredibilityWeight(Math.max(0, Math.min(80, remainder)))
    }
    setScenario('custom')
  }

  const handleSaveWeights = () => {
    const n = narrativeWeight
    const c = credibilityWeight
    const r = riskWeight
    const sum = n + c + r
    const scale = sum > 0 ? 100 / sum : 1
    updateWeights.mutate({
      narrative: Math.round(n * scale),
      credibility: Math.round(c * scale),
      risk: Math.round(r * scale),
    })
  }

  const handleResetToDefault = () => {
    setNarrativeWeight(DEFAULT_NARRATIVE)
    setCredibilityWeight(DEFAULT_CREDIBILITY)
    setRiskWeight(DEFAULT_RISK)
    setScenario('default')
    updateWeights.mutate(DEFAULT_WEIGHTS)
  }

  const isDefault =
    narrativeWeight === DEFAULT_NARRATIVE &&
    credibilityWeight === DEFAULT_CREDIBILITY &&
    riskWeight === DEFAULT_RISK

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <Card className="card-surface">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Provisional IPI weights
            </CardTitle>
            <Badge variant="accent" className="text-xs">
              Provisional
            </Badge>
          </div>
          <CardDescription>
            Experiment with weight scenarios. These are provisional and for display only; audit
            exports use the server-configured weights.
          </CardDescription>
          <div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-500 text-sm">
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            <span>For transparency and experimentation only</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={scenario === 'default' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setScenario('default')
                setNarrativeWeight(DEFAULT_NARRATIVE)
                setCredibilityWeight(DEFAULT_CREDIBILITY)
                setRiskWeight(DEFAULT_RISK)
              }}
            >
              Provisioned (default)
            </Button>
            <Button
              variant={scenario === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScenario('custom')}
            >
              Custom (experimental)
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                Narrative: {narrativeWeight}%
              </Label>
              <Slider
                value={[narrativeWeight]}
                onValueChange={([v]) => handleSliderChange('narrative', v)}
                max={80}
                min={10}
                step={5}
                className="mt-2"
                aria-label="Narrative weight"
              />
            </div>
            <div>
              <Label>
                Credibility: {credibilityWeight}%
              </Label>
              <Slider
                value={[credibilityWeight]}
                onValueChange={([v]) => handleSliderChange('credibility', v)}
                max={80}
                min={10}
                step={5}
                className="mt-2"
                aria-label="Credibility weight"
              />
            </div>
            <div>
              <Label>
                Risk: {riskWeight}%
              </Label>
              <Slider
                value={[riskWeight]}
                onValueChange={([v]) => handleSliderChange('risk', v)}
                max={50}
                min={5}
                step={5}
                className="mt-2"
                aria-label="Risk weight"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Sum: {total}%. Server default: Narrative 40%, Credibility 40%, Risk 20%.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveWeights}
              disabled={updateWeights.isPending || isDefault}
            >
              {updateWeights.isPending ? 'Saving…' : 'Save weights'}
            </Button>
            <Button variant="outline" onClick={handleResetToDefault}>
              Reset to default
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-surface border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Live preview
            <Badge variant="accent" className="text-xs">
              Provisional
            </Badge>
          </CardTitle>
          <CardDescription>
            Sample IPI composition based on your current weights. Delta vs. default scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums">{preview.score}</span>
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
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md bg-background/60 p-2 text-center">
              <p className="text-muted-foreground">Narrative</p>
              <p className="font-semibold">{normalized.n.toFixed(0)}%</p>
            </div>
            <div className="rounded-md bg-background/60 p-2 text-center">
              <p className="text-muted-foreground">Credibility</p>
              <p className="font-semibold">{normalized.c.toFixed(0)}%</p>
            </div>
            <div className="rounded-md bg-background/60 p-2 text-center">
              <p className="text-muted-foreground">Risk</p>
              <p className="font-semibold">{normalized.r.toFixed(0)}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Narrative 40% · Credibility 40% · Risk 20% (provisional weights). Audit exports use
            server-configured weights.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
