import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useIPISnapshot, useRequestExport } from '@/hooks/useIPI'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Download, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['rgb(var(--primary))', 'rgb(var(--accent))', 'rgb(var(--success))']

export function CompanyView() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const start = searchParams.get('start') ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const end = searchParams.get('end') ?? new Date().toISOString().slice(0, 10)

  const { data: snapshot, isLoading: snapshotLoading } = useIPISnapshot(
    id ?? '',
    start,
    end
  )
  const exportMutation = useRequestExport()

  const isLoading = snapshotLoading

  if (isLoading || !snapshot) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const pieData = [
    { name: 'Narrative', value: snapshot.breakdown.narrative * 100, color: COLORS[0] },
    { name: 'Credibility', value: snapshot.breakdown.credibility * 100, color: COLORS[1] },
    { name: 'Risk', value: snapshot.breakdown.risk * 100, color: COLORS[2] },
  ]

  const DirectionIcon = snapshot.direction === 'up' ? TrendingUp : snapshot.direction === 'down' ? TrendingDown : Minus

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{snapshot.company_name}</h1>
            <p className="text-sm text-muted-foreground">
              {start} – {end} · Weight version: {snapshot.weight_version}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              exportMutation.mutate({
                companyId: snapshot.company_id,
                windowStart: start,
                windowEnd: end,
                format: 'both',
              })
            }
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export snapshot
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>IPI score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{Math.round(snapshot.score)}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-sm font-medium',
                    snapshot.direction === 'up' && 'text-success',
                    snapshot.direction === 'down' && 'text-destructive',
                    snapshot.direction === 'flat' && 'text-muted-foreground'
                  )}
                >
                  <DirectionIcon className="h-4 w-4" />
                  {snapshot.direction !== 'flat'
                    ? `${snapshot.percent_change > 0 ? '+' : ''}${snapshot.percent_change.toFixed(1)}%`
                    : 'No change'}
                </span>
              </div>
              <div className="mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top narratives</CardTitle>
              <p className="text-sm text-muted-foreground">Contributions to IPI</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {snapshot.top_narratives?.slice(0, 5).map((n) => (
                  <li key={n.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{n.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {(n.contribution * 100).toFixed(0)}%
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to={`/dashboard/drilldown/${n.id}?company=${snapshot.company_id}&start=${start}&end=${end}`}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link
                  to={`/dashboard/drilldown/${snapshot.top_narratives?.[0]?.id ?? ''}?company=${snapshot.company_id}&start=${start}&end=${end}`}
                >
                  Why did this move?
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. 
              Full methodology and provenance in About & Help.
            </p>
          </CardContent>
        </Card>
      </div>
  )
}
