import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { FileJson, Play, Calendar, RefreshCw, AlertCircle, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEvent } from '@/types/narrative'

interface TimelineViewProps {
  events?: NarrativeEvent[] | null
  isLoading?: boolean
  error?: string | Error | null
  onRetry?: () => void
  onViewPayload?: (rawPayloadId: string) => void
  onReplay?: (eventId: string) => void
  onEmptyAction?: () => void
  emptyStateActionLabel?: string
}

const EVENTS_PER_PAGE = 8
const SKELETON_GROUPS = 3
const SKELETON_ITEMS_PER_GROUP = 3

export function TimelineView({
  events = [],
  isLoading = false,
  error = null,
  onRetry,
  onViewPayload,
  onReplay,
  onEmptyAction,
  emptyStateActionLabel = 'Change time window',
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

  const errorMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : null

  if (isLoading) {
    return (
      <Card className="card-surface transition-all duration-200">
        <CardHeader>
          <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
            Timeline
          </h1>
          <p className="text-sm text-muted-foreground">Key events in this window</p>
        </CardHeader>
        <CardContent className="animate-fade-in">
          <div className="space-y-6" role="status" aria-label="Loading timeline events">
            {Array.from({ length: SKELETON_GROUPS }).map((_, g) => (
              <div key={g}>
                <Skeleton className="mb-2 h-4 w-24 rounded-md bg-muted" />
                <ul className="space-y-2">
                  {Array.from({ length: SKELETON_ITEMS_PER_GROUP }).map((_, i) => (
                    <li
                      key={`${g}-${i}`}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <Skeleton className="h-3.5 w-14 shrink-0 rounded bg-muted" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <Skeleton className="h-4 w-full max-w-[80%] rounded bg-muted" />
                        <Skeleton className="h-3 w-20 rounded bg-muted" />
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Skeleton className="h-8 w-8 rounded-md bg-muted" />
                        <Skeleton className="h-8 w-8 rounded-md bg-muted" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (errorMessage) {
    return (
      <Card className="card-surface transition-all duration-200 border-destructive/30">
        <CardHeader>
          <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
            Timeline
          </h1>
          <p className="text-sm text-muted-foreground">Key events in this window</p>
        </CardHeader>
        <CardContent>
          <div
            role="alert"
            className={cn(
              'flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in'
            )}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <p className="flex-1 min-w-0">{errorMessage}</p>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-fit gap-2 border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Retry loading timeline events"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (safeEvents.length === 0) {
    const handleEmptyAction = onEmptyAction ?? (() => {
      document.getElementById('company-selector-time-window')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return (
      <Card className="card-surface transition-all duration-200">
        <CardHeader>
          <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
            Timeline
          </h1>
          <p className="text-sm text-muted-foreground">Key events in this window</p>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
            role="status"
            aria-label="No timeline events"
          >
            <Calendar
              className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-4"
              aria-hidden
            />
            <p className="text-muted-foreground mb-1">No events in the selected window</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Try a different time range or recalculate IPI to see narrative events here.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleEmptyAction}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={emptyStateActionLabel}
            >
              <CalendarRange className="h-4 w-4" aria-hidden />
              {emptyStateActionLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
          Timeline
        </h1>
        <p className="text-sm text-muted-foreground">
          {safeEvents.length} event{safeEvents.length !== 1 ? 's' : ''} in this window
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className="h-[320px] pr-2"
          aria-label="Timeline events list"
        >
          <div className="space-y-6">
            {paginatedBuckets.map(([dateKey, evs]) => (
              <div key={dateKey}>
                <p
                  className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"
                  aria-hidden
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {format(new Date(dateKey), 'MMM d, yyyy')}
                </p>
                <ul className="space-y-2" role="list">
                  {evs.map((ev) => (
                    <li
                      key={ev.event_id}
                      role="listitem"
                      className={cn(
                        'flex items-start gap-3 rounded-lg border border-border bg-card p-3',
                        'transition-colors duration-200 hover:bg-muted/50'
                      )}
                    >
                      <span
                        className="text-xs text-muted-foreground shrink-0 w-20"
                        aria-hidden
                      >
                        {ev.original_timestamp
                          ? format(new Date(ev.original_timestamp), 'HH:mm')
                          : '—'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate" title={ev.raw_text ?? undefined}>
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
                          className="h-8 w-8 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={() => onViewPayload?.(ev.raw_payload_id)}
                          aria-label={`View raw payload for event: ${(ev.raw_text ?? '').slice(0, 40)}`}
                        >
                          <FileJson className="h-4 w-4" aria-hidden />
                        </Button>
                        {onReplay && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onClick={() => onReplay(ev.event_id)}
                            aria-label={`Replay event: ${(ev.raw_text ?? '').slice(0, 40)}`}
                          >
                            <Play className="h-4 w-4" aria-hidden />
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
          <nav
            className="mt-4 flex items-center justify-between border-t border-border pt-4"
            aria-label="Timeline pagination"
          >
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Go to previous page"
                className="transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Go to next page"
                className="transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Next
              </Button>
            </div>
          </nav>
        )}
      </CardContent>
    </Card>
  )
}
