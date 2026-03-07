import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PeerSnapshot } from '@/types/company-view'

interface PeerSnapshotPanelProps {
  peers?: PeerSnapshot[] | null
  windowStart?: string
  windowEnd?: string
}

/** MVP: Static placeholder peers. Replace with API when available. */
const MOCK_PEERS: PeerSnapshot[] = [
  { id: 'p1', name: 'Peer A', ticker: 'PA', score: 72, delta: 2.1 },
  { id: 'p2', name: 'Peer B', ticker: 'PB', score: 68, delta: -1.2 },
  { id: 'p3', name: 'Peer C', ticker: 'PC', score: 75, delta: 0 },
]

export function PeerSnapshotPanel({
  peers = [],
  windowStart = '',
  windowEnd = '',
}: PeerSnapshotPanelProps) {
  const safePeers = Array.isArray(peers) && peers.length > 0 ? peers : MOCK_PEERS

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Peer Snapshot
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Contextual metrics (MVP placeholder)
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {safePeers.map((p) => {
            const delta = p.delta ?? 0
            const Icon =
              delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
            return (
              <li key={p.id}>
                <Link
                  to={`/dashboard/company/${p.id}?start=${windowStart}&end=${windowEnd}`}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm',
                    'transition-colors hover:bg-muted'
                  )}
                  aria-label={`View ${p.name} IPI snapshot`}
                >
                  <span className="font-medium truncate">{p.ticker ?? p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.score != null && (
                      <span className="text-muted-foreground tabular-nums">
                        {p.score.toFixed(1)}
                      </span>
                    )}
                    {delta !== 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 text-xs',
                          delta > 0 && 'text-success',
                          delta < 0 && 'text-destructive'
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {delta > 0 ? '+' : ''}
                        {delta.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
