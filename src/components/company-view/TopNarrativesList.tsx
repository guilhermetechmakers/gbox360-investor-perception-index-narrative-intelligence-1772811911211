import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScorePill } from '@/components/signals/ScorePill'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'

export interface NarrativeItem {
  narrativeId: string
  name: string
  summary?: string
  contribution: number
  authority?: string
  credibility?: number | null
  risk?: number | null
}

interface TopNarrativesListProps {
  narratives?: NarrativeItem[] | null
  onDrilldown?: (narrativeId: string) => void
  companyId?: string
  windowStart?: string
  windowEnd?: string
  provenanceId?: string
}

export function TopNarrativesList({
  narratives = [],
  onDrilldown,
  companyId = '',
  windowStart = '',
  windowEnd = '',
  provenanceId = '',
}: TopNarrativesListProps) {
  const safeNarratives = Array.isArray(narratives) ? narratives.slice(0, 3) : []

  if (safeNarratives.length === 0) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-xl">Top Narratives</CardTitle>
          <p className="text-sm text-muted-foreground">Contributions to IPI</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center" role="status" aria-label="No narrative data for this window">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground">No narrative data for this window</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try a different time range or explore all narratives in the platform.
            </p>
            <Button
              variant="default"
              size="sm"
              className="mt-4 min-h-[44px] min-w-[120px]"
              asChild
              aria-label="Explore all narratives in dashboard"
            >
              <Link to="/dashboard/narratives" className="inline-flex items-center gap-2">
                Explore narratives
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl">Top Narratives</CardTitle>
        <p className="text-sm text-muted-foreground">Contributions to IPI</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {safeNarratives.map((n) => (
            <li
              key={n.narrativeId}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{n.name}</p>
                  {n.summary && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {n.summary}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge variant="accent" className="text-xs">
                    {(n.contribution * 100).toFixed(0)}%
                  </Badge>
                  {typeof n.credibility === 'number' && (
                    <ScorePill score={n.credibility} variant="credibility" size="sm" showLabel={false} />
                  )}
                  {typeof n.risk === 'number' && (
                    <ScorePill score={n.risk} variant="risk" size="sm" showLabel={false} />
                  )}
                  {n.authority && (
                    <span className="text-xs text-muted-foreground">
                      {n.authority}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                asChild
                onClick={() => onDrilldown?.(n.narrativeId)}
                aria-label={`View events for narrative: ${n.name}`}
              >
                <Link
                  to={`/dashboard/drilldown/${n.narrativeId}?company=${companyId}&start=${windowStart}&end=${windowEnd}${provenanceId ? `&provenance=${encodeURIComponent(provenanceId)}` : ''}`}
                >
                  View events
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
