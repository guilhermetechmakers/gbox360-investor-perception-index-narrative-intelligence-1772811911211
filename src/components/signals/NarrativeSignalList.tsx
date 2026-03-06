/**
 * NarrativeSignalList - list of signals for a narrative with counts and source references
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureArray } from '@/lib/runtime-safe'
import { SignalBadge } from '@/components/signals/SignalBadge'
import { ScorePill } from '@/components/signals/ScorePill'
import { FileText } from 'lucide-react'
import type { SignalRecord } from '@/types/signals'

interface NarrativeSignalListProps {
  signals?: SignalRecord[] | null
  credibilityScore?: number | null
  riskScore?: number | null
  title?: string
  emptyMessage?: string
  maxItems?: number
  className?: string
}

export function NarrativeSignalList({
  signals,
  credibilityScore,
  riskScore,
  title = 'Signals',
  emptyMessage = 'No signals for this narrative',
  maxItems = 10,
  className,
}: NarrativeSignalListProps) {
  const safeSignals = ensureArray(signals).slice(0, maxItems)
  const credibility = credibilityScore != null ? Number(credibilityScore) : null
  const risk = riskScore != null ? Number(riskScore) : null
  const hasScores = credibility != null || risk != null
  const hasList = safeSignals.length > 0

  if (!hasScores && !hasList) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className ?? 'card-surface transition-all duration-200 hover:shadow-card-hover'}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasScores && (
          <div className="flex flex-wrap gap-2">
            {credibility != null && (
              <ScorePill score={credibility} label="Credibility" variant="credibility" />
            )}
            {risk != null && (
              <ScorePill score={risk} label="Risk" variant="risk" />
            )}
          </div>
        )}
        {hasList && (
          <ul className="space-y-2" role="list" aria-label="Signal list">
            {safeSignals.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <SignalBadge signal={s} variant={s.type.includes('earnings') || s.type.includes('legal') ? 'risk' : 'credibility'} />
                <span className="text-xs text-muted-foreground truncate max-w-[140px]" title={s.source}>
                  {s.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
