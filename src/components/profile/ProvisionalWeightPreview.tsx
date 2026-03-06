import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettingsWeights, useUpdateSettingsWeights } from '@/hooks/useSettings'
import { useSavedCompanies } from '@/hooks/useCompanies'
import { BarChart3, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_N = 40
const DEFAULT_C = 40
const DEFAULT_R = 20

function computePreviewIPI(
  n: number,
  c: number,
  r: number
): { score: number; delta: number } {
  const baseScore = 65
  const score = Math.round(baseScore * (0.4 * (n / 100) + 0.4 * (c / 100) + 0.2 * (1 - r / 100)))
  const prevScore = Math.round(baseScore * (0.4 * 0.4 + 0.4 * 0.4 + 0.2 * 0.8))
  return { score: Math.min(100, Math.max(0, score)), delta: score - prevScore }
}

export interface ProvisionalWeightPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProvisionalWeightPreview({ open, onOpenChange }: ProvisionalWeightPreviewProps) {
  const { data: weightsData } = useSettingsWeights()
  const { data: savedCompanies = [] } = useSavedCompanies()
  const updateWeights = useUpdateSettingsWeights()

  const [narrative, setNarrative] = useState(weightsData?.narrative ?? DEFAULT_N)
  const [credibility, setCredibility] = useState(weightsData?.credibility ?? DEFAULT_C)
  const [risk, setRisk] = useState(weightsData?.risk ?? DEFAULT_R)
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  const companies = Array.isArray(savedCompanies) ? savedCompanies : []

  useEffect(() => {
    if (weightsData) {
      setNarrative(weightsData.narrative ?? DEFAULT_N)
      setCredibility(weightsData.credibility ?? DEFAULT_C)
      setRisk(weightsData.risk ?? DEFAULT_R)
    }
  }, [weightsData, open])

  const total = narrative + credibility + risk
  const normalized = useMemo(() => {
    if (total === 0) return { n: 0, c: 0, r: 0 }
    return {
      n: (narrative / total) * 100,
      c: (credibility / total) * 100,
      r: (risk / total) * 100,
    }
  }, [narrative, credibility, risk, total])

  const preview = useMemo(
    () => computePreviewIPI(normalized.n, normalized.c, normalized.r),
    [normalized]
  )

  const handleSave = () => {
    const sum = narrative + credibility + risk
    const scale = sum > 0 ? 100 / sum : 1
    updateWeights.mutate(
      {
        narrative: Math.round(narrative * scale),
        credibility: Math.round(credibility * scale),
        risk: Math.round(risk * scale),
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Provisional weight scenarios
            </DialogTitle>
            <Badge variant="accent" className="text-xs">
              Provisional
            </Badge>
          </div>
          <DialogDescription>
            Preview how weight changes affect IPI metrics. For transparency and experimentation only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label>Company (for context)</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {(companies ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.ticker ? ` (${c.ticker})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label>Narrative: {narrative}%</Label>
            <Slider
              value={[narrative]}
              onValueChange={([v]) => setNarrative(v)}
              max={80}
              min={10}
              step={5}
              aria-label="Narrative weight"
            />
          </div>
          <div className="space-y-3">
            <Label>Credibility: {credibility}%</Label>
            <Slider
              value={[credibility]}
              onValueChange={([v]) => setCredibility(v)}
              max={80}
              min={10}
              step={5}
              aria-label="Credibility weight"
            />
          </div>
          <div className="space-y-3">
            <Label>Risk: {risk}%</Label>
            <Slider
              value={[risk]}
              onValueChange={([v]) => setRisk(v)}
              max={50}
              min={5}
              step={5}
              aria-label="Risk weight"
            />
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
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
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {preview.delta > 0 ? '+' : ''}
                  {preview.delta} vs default
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 shrink-0" />
              Audit exports use server-configured weights.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={updateWeights.isPending}>
            {updateWeights.isPending ? 'Saving…' : 'Apply weights'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
