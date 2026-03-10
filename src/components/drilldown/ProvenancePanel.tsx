import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/profile/EmptyState'
import { Calculator, FileJson, Scale, Copy, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AuditProvenance } from '@/types/narrative'

interface ProvenancePanelProps {
  provenance: AuditProvenance | null | undefined
  isLoading?: boolean
  /** Optional error message; when set, shows error state instead of content */
  error?: string | null
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
  error,
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

  const cardClassName = cn(className)

  if (isLoading) {
    return (
      <Card
        className={cardClassName}
        aria-label="Calculation provenance"
        aria-busy="true"
        aria-live="polite"
      >
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-md" aria-hidden />
            <Skeleton className="h-4 w-64 max-w-full rounded-md" aria-hidden />
            <Skeleton className="h-3 w-40 rounded-md" aria-hidden />
          </div>
        </CardHeader>
        <CardContent className="space-y-6" aria-hidden>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <section>
            <Skeleton className="h-4 w-44 mb-2 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </section>
          <section>
            <Skeleton className="h-4 w-32 mb-2 rounded-md" />
            <div className="h-[200px] rounded-lg border border-border p-3 space-y-4">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-11/12 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-5/6 rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
          </section>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cardClassName} aria-label="Calculation provenance error">
        <CardHeader>
          <CardTitle className="text-xl">Calculation Provenance</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
            title="Unable to load provenance"
            description={error}
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  if (!provenance) {
    return (
      <Card className={cardClassName} aria-label="Calculation provenance">
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
      className={cardClassName}
      aria-label="Calculation provenance: input vectors, weights, and computed IPI score"
      role="region"
    >
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle id="provenance-title" className="text-xl flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" aria-hidden />
            Calculation Provenance
          </CardTitle>
          <p id="provenance-description" className="text-sm text-muted-foreground mt-1">
            Exact input vectors and weights used for this IPI calculation. Provisional weights.
          </p>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1" aria-label={`Computed at ${new Date(timestamp).toLocaleString()}`}>
              Computed at {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyProvenance}
          disabled={isCopying}
          className="shrink-0"
          aria-label={isCopying ? 'Copying provenance to clipboard' : 'Copy full provenance as JSON to clipboard'}
          aria-busy={isCopying}
        >
          {isCopying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden sm:inline">{isCopying ? 'Copying…' : 'Copy as JSON'}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6" aria-labelledby="provenance-title" aria-describedby="provenance-description">
        <div className="flex items-center gap-2" role="group" aria-label="Computed IPI score">
          <span id="computed-ipi-label" className="text-sm font-medium text-muted-foreground">Computed IPI</span>
          <Badge
            variant="accent"
            className="text-lg font-bold"
            aria-labelledby="computed-ipi-label"
            aria-describedby="computed-ipi-value"
          >
            <span id="computed-ipi-value" aria-label={`Score: ${typeof computedIPI === 'number' ? computedIPI.toFixed(2) : 'not available'}`}>
              {typeof computedIPI === 'number' ? computedIPI.toFixed(2) : '—'}
            </span>
          </Badge>
        </div>

        {weightsUsed && (
          <section aria-labelledby="weights-heading" role="region">
            <h4 id="weights-heading" className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Scale className="h-4 w-4 text-muted-foreground" aria-hidden />
              Weights Used (Provisional)
            </h4>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Weight percentages for narrative, credibility, and risk">
              <Badge variant="outline" className="text-xs" role="listitem" aria-label={`Narrative weight: ${((weightsUsed.narrative ?? 0.4) * 100).toFixed(0)}%`}>
                Narrative: {(weightsUsed.narrative ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs" role="listitem" aria-label={`Credibility weight: ${((weightsUsed.credibility ?? 0.4) * 100).toFixed(0)}%`}>
                Credibility: {(weightsUsed.credibility ?? 0.4) * 100}%
              </Badge>
              <Badge variant="outline" className="text-xs" role="listitem" aria-label={`Risk weight: ${((weightsUsed.risk ?? 0.2) * 100).toFixed(0)}%`}>
                Risk: {(weightsUsed.risk ?? 0.2) * 100}%
              </Badge>
            </div>
          </section>
        )}

        <section aria-labelledby="input-vectors-heading" role="region">
          <h4 id="input-vectors-heading" className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <FileJson className="h-4 w-4 text-muted-foreground" aria-hidden />
            Input Vectors
          </h4>
          <ScrollArea
            className="h-[200px] rounded-lg border border-border bg-card p-3"
            aria-label="Input vectors: narrative metrics, credibility proxies, and risk flags"
            role="region"
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

        <p id="provenance-audit-note" className="text-xs text-muted-foreground border-t border-border pt-4" role="note">
          IPI = 0.4 × Narrative + 0.4 × Credibility + 0.2 × Risk. All inputs and weights are logged for audit.
        </p>
      </CardContent>
    </Card>
  )
}
