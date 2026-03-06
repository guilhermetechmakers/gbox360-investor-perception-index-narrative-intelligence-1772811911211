import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSavedCompanies } from '@/hooks/useCompanies'
import { useDashboardCards } from '@/hooks/useIPI'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: '7D', start: subDays(new Date(), 7), end: new Date() },
  { label: '30D', start: subDays(new Date(), 30), end: new Date() },
  { label: '90D', start: subDays(new Date(), 90), end: new Date() },
]

export function Dashboard() {
  const [windowPreset, setWindowPreset] = useState(0)
  const { start, end } = PRESETS[windowPreset]
  const windowStart = format(start, 'yyyy-MM-dd')
  const windowEnd = format(end, 'yyyy-MM-dd')

  const { data: saved, isLoading: savedLoading } = useSavedCompanies()
  const companyIds = useMemo(() => saved?.map((c) => c.id) ?? [], [saved])
  const { data: cards, isLoading: cardsLoading } = useDashboardCards(
    companyIds,
    windowStart,
    windowEnd
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {PRESETS.map((p, i) => (
            <Button
              key={p.label}
              variant={windowPreset === i ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWindowPreset(i)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {savedLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {!savedLoading && (!saved || saved.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No saved companies yet</p>
            <p className="text-sm text-muted-foreground">Search and save companies to see IPI quick cards here.</p>
            <Button asChild className="mt-4">
              <Link to="/dashboard">Search companies</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!savedLoading && saved && saved.length > 0 && (
        <>
          {cardsLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {saved.map((c) => (
                <Skeleton key={c.id} className="h-40 rounded-lg" />
              ))}
            </div>
          )}
          {!cardsLoading && cards && cards.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((snap) => (
                <Card key={snap.company_id} className="transition-all hover:shadow-card-hover hover:-translate-y-0.5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{snap.company_name}</CardTitle>
                      <Badge direction={snap.direction} change={snap.percent_change} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{Math.round(snap.score)}</span>
                      <span className="text-muted-foreground">IPI</span>
                    </div>
                    {snap.top_narratives?.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        Top: {snap.top_narratives.slice(0, 2).map((n) => n.label).join(', ')}
                      </p>
                    )}
                    <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                      <Link
                        to={`/dashboard/company/${snap.company_id}?start=${windowStart}&end=${windowEnd}`}
                      >
                        View details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!cardsLoading && (!cards || cards.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No IPI data for the selected window. Try another period.
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Provisional weights:</strong> Narrative 40%, Credibility 40%, Risk 20%. 
            Adjustable in Settings. All inputs and provenance are logged for audit.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Badge({
  direction,
  change,
}: {
  direction: 'up' | 'down' | 'flat'
  change: number
}) {
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        direction === 'up' && 'bg-success/20 text-success',
        direction === 'down' && 'bg-destructive/20 text-destructive',
        direction === 'flat' && 'bg-muted text-muted-foreground'
      )}
    >
      <Icon className="h-3 w-3" />
      {direction !== 'flat' ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '—'}
    </span>
  )
}
