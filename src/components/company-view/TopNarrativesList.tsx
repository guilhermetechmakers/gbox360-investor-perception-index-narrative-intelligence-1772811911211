import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'

export interface NarrativeItem {
  narrativeId: string
  name: string
  summary?: string
  contribution: number
  authority?: string
}

interface TopNarrativesListProps {
  narratives?: NarrativeItem[] | null
  onDrilldown?: (narrativeId: string) => void
  companyId?: string
  windowStart?: string
  windowEnd?: string
}

export function TopNarrativesList({
  narratives = [],
  onDrilldown,
  companyId = '',
  windowStart = '',
  windowEnd = '',
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
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No narrative data for this window</p>
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
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="accent" className="text-xs">
                    {(n.contribution * 100).toFixed(0)}%
                  </Badge>
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
              >
                <Link
                  to={`/dashboard/drilldown/${n.narrativeId}?company=${companyId}&start=${windowStart}&end=${windowEnd}`}
                >
                  View events
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
