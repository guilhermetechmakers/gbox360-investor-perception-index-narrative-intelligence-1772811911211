import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/profile/EmptyState'
import { Calculator, FileJson, Scale, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AuditProvenance } from '@/types/narrative'

interface ProvenancePanelProps {
  provenance: AuditProvenance | null | undefined
  isLoading?: boolean
  /** Optional action to show in empty state (e.g. "Run IPI calculation" button) */
  emptyAction?: React.ReactNode
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
  emptyAction,
  className,
}: ProvenancePanelProps) {
  const [isCopying, setIsCopying] = useState(false)

  const handleCopyProvenance = useCallback(async () => {
    if (!provenance) return
    setIsCopying(true)
    try {
      const json = JSON.stringify(provenance, null, 2)
      await navigator.clipboard.writeText(json)
      toast.success('Provenance copied to clipboard')
    } catch {
      toast.error('Failed to copy provenance')
    } finally {
      setIsCopying(false)
    }
  }, [provenance])

  if (isLoading) {
    return (
      <Card
        className={cn('card-surface', className)}
        aria-label="Calculation provenance"
        aria-busy="true"
      >
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
      <Card
        className={cn('card-surface', className)}
        aria-label="Calculation provenance"
      >
        <CardHeader>
          <CardTitle className="text-xl">Calculation Provenance</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calculator className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No provenance data"
            description="Run an IPI calculation to see input vectors, weights, and computed values for audit."
            action={emptyAction}
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  const { inputVector, weightsUsed, computedIPI, timestamp } = provenance
  const narrativeMetrics = inputVector?.narrativeMetrics ?? {}
  const credibilityProxies = inputVector?.credibilityProxies ?? {}
  const riskFlags = inputVector?.riskFlags ?? {}

  return (
    <Card
      className={cn('card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5', className)}
      aria-label="Calculation provenance"
    >
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle id="provenance-title" className="text-xl flex items-center gap-2">
            <Calculator className="h-5 w-5" aria-hidden />
            Calculation Provenance
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Exact input vectors and weights used for this IPI calculation. Provisional weights.
          </p>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1">Computed at {new Date(timestamp).toLocaleString()}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyProvenance}
          disabled={isCopying}
          className="shrink-0"
          aria-label={isCopying ? 'Copying provenance to clipboard' : 'Copy provenance as JSON to clipboard'}
        >
          {isCopying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden sm:inline">{isCopying ? 'Copying…' : 'Copy as JSON'}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6" aria-labelledby="provenance-title">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Computed IPI</span>
          <Badge variant="accent" className="text-lg font-bold" aria-label={`Computed IPI score: ${typeof computedIPI === 'number' ? computedIPI.toFixed(2) : 'not available'}`}>
            {typeof computedIPI === 'number' ? computedIPI.toFixed(2) : '—'}
          </Badge>
        </div>

        {weightsUsed && (
          <section aria-labelledby="weights-heading">
            <h4 id="weights-heading" className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Scale className="h-4 w-4" aria-hidden />
              Weights Used (Provisional)
            </h4>
            <div className="flex flex-wrap gap-2" role="list">
              <Badge variant="outline" className="text-xs" role="listitem">
                Narrative: {(weightsUsed.narrative ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs" role="listitem">
                Credibility: {(weightsUsed.credibility ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs" role="listitem">
                Risk: {(weightsUsed.risk ?? 0.2) * 100}%
              </Badge>
            </div>
          </section>
        )}

        <section aria-labelledby="input-vectors-heading">
          <h4 id="input-vectors-heading" className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <FileJson className="h-4 w-4" aria-hidden />
            Input Vectors
          </h4>
          <ScrollArea
            className="h-[200px] rounded-lg border border-border p-3"
            aria-label="Narrative metrics, credibility proxies, and risk flags"
          >
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
        </section>

        <p className="text-xs text-muted-foreground border-t border-border pt-4" role="note">
          IPI = 0.4 × Narrative + 0.4 × Credibility + 0.2 × Risk. All inputs and weights are logged for audit.
        </p>
      </CardContent>
    </Card>
  )
}
