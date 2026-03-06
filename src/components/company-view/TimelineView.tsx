import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { FileJson, Play, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEvent } from '@/types/narrative'

interface TimelineViewProps {
  events?: NarrativeEvent[] | null
  onViewPayload?: (rawPayloadId: string) => void
  onReplay?: (eventId: string) => void
}

const EVENTS_PER_PAGE = 8

export function TimelineView({
  events = [],
  onViewPayload,
  onReplay,
}: TimelineViewProps) {
  const safeEvents = Array.isArray(events) ? events : []
  const [page, setPage] = useState(0)

  const bucketed = useMemo(() => {
    const byDate = new Map<string, NarrativeEvent[]>()
    for (const ev of safeEvents) {
      const dateKey =
        ev.original_timestamp?.slice(0, 10) ?? ev.ingestion_timestamp?.slice(0, 10) ?? 'unknown'
      const list = byDate.get(dateKey) ?? []
      list.push(ev)
      byDate.set(dateKey, list)
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .reverse()
  }, [safeEvents])

  const paginatedBuckets = useMemo(() => {
    let count = 0
    const result: Array<[string, NarrativeEvent[]]> = []
    for (const bucket of bucketed) {
      if (count + bucket[1].length > (page + 1) * EVENTS_PER_PAGE) break
      if (count >= page * EVENTS_PER_PAGE) {
        result.push(bucket)
      }
      count += bucket[1].length
    }
    return result
  }, [bucketed, page])

  const totalPages = Math.max(
    1,
    Math.ceil(safeEvents.length / EVENTS_PER_PAGE)
  )

  if (safeEvents.length === 0) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-xl">Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">Key events in this window</p>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <Calendar className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No events in the selected window</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl">Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          {safeEvents.length} event{safeEvents.length !== 1 ? 's' : ''} in this window
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-6">
            {paginatedBuckets.map(([dateKey, evs]) => (
              <div key={dateKey}>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(dateKey), 'MMM d, yyyy')}
                </p>
                <ul className="space-y-2">
                  {evs.map((ev) => (
                    <li
                      key={ev.event_id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border border-border p-3',
                        'transition-colors hover:bg-muted/50'
                      )}
                    >
                      <span className="text-xs text-muted-foreground shrink-0 w-20">
                        {ev.original_timestamp
                          ? format(new Date(ev.original_timestamp), 'HH:mm')
                          : '—'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" title={ev.raw_text}>
                          {ev.raw_text?.slice(0, 80) ?? '—'}
                          {(ev.raw_text?.length ?? 0) > 80 ? '…' : ''}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {ev.source ?? 'Unknown'}
                          {ev.authority_score != null &&
                            ` · ${(ev.authority_score * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onViewPayload?.(ev.raw_payload_id)}
                          aria-label="View raw payload"
                        >
                          <FileJson className="h-4 w-4" />
                        </Button>
                        {onReplay && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onReplay(ev.event_id)}
                            aria-label="Replay"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
