import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calculator, FileJson, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditProvenance } from '@/types/narrative'

interface ProvenancePanelProps {
  provenance: AuditProvenance | null | undefined
  isLoading?: boolean
  className?: string
}

function formatValue(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'number') return v.toFixed(2)
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return JSON.stringify(v)
}

export function ProvenancePanel({
  provenance,
  isLoading,
  className,
}: ProvenancePanelProps) {
  if (isLoading) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!provenance) {
    return (
      <Card className={cn('card-surface', className)}>
        <CardHeader>
          <CardTitle className="text-xl">Calculation Provenance</CardTitle>
          <p className="text-sm text-muted-foreground">
            No provenance data available. Run IPI calculation to see input vectors and weights.
          </p>
        </CardHeader>
      </Card>
    )
  }

  const { inputVector, weightsUsed, computedIPI, timestamp } = provenance
  const narrativeMetrics = inputVector?.narrativeMetrics ?? {}
  const credibilityProxies = inputVector?.credibilityProxies ?? {}
  const riskFlags = inputVector?.riskFlags ?? {}

  return (
    <Card className={cn('card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5', className)}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculation Provenance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Exact input vectors and weights used for this IPI calculation. Provisional weights.
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">Computed at {new Date(timestamp).toLocaleString()}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Computed IPI</span>
          <Badge variant="accent" className="text-lg font-bold">
            {typeof computedIPI === 'number' ? computedIPI.toFixed(2) : '—'}
          </Badge>
        </div>

        {weightsUsed && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Scale className="h-4 w-4" />
              Weights Used (Provisional)
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Narrative: {(weightsUsed.narrative ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                Credibility: {(weightsUsed.credibility ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                Risk: {(weightsUsed.risk ?? 0.2) * 100}%
              </Badge>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <FileJson className="h-4 w-4" />
            Input Vectors
          </h4>
          <ScrollArea className="h-[200px] rounded-lg border border-border p-3">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Narrative metrics</p>
                <ul className="space-y-0.5">
                  {Object.entries(narrativeMetrics).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono">{formatValue(v)}</span>
                    </li>
                  ))}
                  {Object.keys(narrativeMetrics).length === 0 && (
                    <li className="text-muted-foreground">—</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Credibility proxies</p>
                <ul className="space-y-0.5">
                  {Object.entries(credibilityProxies).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono">{formatValue(v)}</span>
                    </li>
                  ))}
                  {Object.keys(credibilityProxies).length === 0 && (
                    <li className="text-muted-foreground">—</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Risk flags</p>
                <ul className="space-y-0.5">
                  {Object.entries(riskFlags).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono">{formatValue(v)}</span>
                    </li>
                  ))}
                  {Object.keys(riskFlags).length === 0 && (
                    <li className="text-muted-foreground">—</li>
                  )}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>

        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          IPI = 0.4 × Narrative + 0.4 × Credibility + 0.2 × Risk. All inputs and weights are logged for audit.
        </p>
      </CardContent>
    </Card>
  )
}
