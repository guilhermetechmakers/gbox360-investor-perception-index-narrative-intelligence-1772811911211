import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { ScorePill } from '@/components/signals/ScorePill'
import { SignalBadge } from '@/components/signals/SignalBadge'
import { format } from 'date-fns'
import { FileJson, ArrowUpDown, ArrowUp, ArrowDown, CalendarX2, Filter } from 'lucide-react'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/runtime-safe'
import type { NarrativeEvent } from '@/types/narrative'
import type { SortByField, SortOrder } from '@/types/drilldown'

interface NarrativeEventsTableProps {
  events: NarrativeEvent[]
  isLoading?: boolean
  /** Inline error message for API or load errors */
  errorMessage?: string | null
  page: number
  totalPages?: number
  total: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onViewRaw: (rawPayloadId: string) => void
  highlightedEventId?: string | null
  currentReplayIndex?: number
  sortBy?: SortByField
  sortOrder?: SortOrder
  onSortChange?: (sortBy: SortByField, sortOrder: SortOrder) => void
  /** Called when user taps empty-state CTA (e.g. scroll to filters) */
  onEmptyAction?: () => void
}

const SNIPPET_LENGTH = 80

function SortHeader({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
}: {
  label: string
  field: SortByField
  currentSortBy?: SortByField
  currentSortOrder?: SortOrder
  onSort?: (sortBy: SortByField, sortOrder: SortOrder) => void
}) {
  const isActive = currentSortBy === field
  const nextOrder =
    isActive && currentSortOrder === 'asc' ? 'desc' : 'asc'
  const SortIcon =
    isActive && currentSortOrder === 'desc' ? ArrowDown : ArrowUp
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => onSort?.(field, nextOrder)}
      aria-sort={
        isActive
          ? currentSortOrder === 'asc'
            ? 'ascending'
            : 'descending'
          : undefined
      }
      aria-label={
        onSort
          ? `Sort by ${label} ${isActive && currentSortOrder === 'asc' ? 'descending' : 'ascending'}`
          : undefined
      }
    >
      {label}
      {onSort ? (
        isActive ? (
          <SortIcon className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )
      ) : null}
    </button>
  )
}

export function NarrativeEventsTable({
  events,
  isLoading,
  errorMessage,
  page,
  totalPages: totalPagesProp,
  total,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onViewRaw,
  highlightedEventId: highlightedEventIdProp,
  currentReplayIndex,
  sortBy,
  sortOrder,
  onSortChange,
  onEmptyAction,
}: NarrativeEventsTableProps) {
  const safeEvents = ensureArray(events)
  const totalPages = totalPagesProp ?? Math.max(1, Math.ceil(total / pageSize))
  const highlightedEventId =
    highlightedEventIdProp ??
    (typeof currentReplayIndex === 'number' && safeEvents[currentReplayIndex]
      ? safeEvents[currentReplayIndex].event_id
      : null)
  const hasError = Boolean(errorMessage?.trim())
  const isEmpty = safeEvents.length === 0 && !isLoading

  const getSourceBadgeVariant = (source: string) => {
    const s = (source ?? '').toLowerCase()
    if (s.includes('news')) return 'default'
    if (s.includes('social') || s.includes('twitter') || s.includes('x'))
      return 'secondary'
    if (s.includes('transcript')) return 'accent'
    return 'outline'
  }

  const getAuthorityTier = (score?: number | null) => {
    if (score == null) return '—'
    if (score >= 0.8) return 'Analyst'
    if (score >= 0.5) return 'Media'
    return 'Retail'
  }

  if (isLoading) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading events">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="space-y-4">
        {hasError && (
          <ErrorBanner
            message={errorMessage ?? 'Failed to load events'}
            role="alert"
            className="rounded-lg"
          />
        )}
        <div
          role="region"
          aria-label="No events"
          className="flex flex-col items-center justify-center rounded-[10px] border border-border bg-muted/20 py-12 px-6 text-center shadow-sm transition-shadow duration-200"
        >
          <CalendarX2
            className="h-12 w-12 text-muted-foreground mb-4"
            aria-hidden
          />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No events in this window
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {total > 0
              ? 'No events match the current filters. Try adjusting filters or another page.'
              : 'No narrative events for this narrative in the selected time window.'}
          </p>
          {onEmptyAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEmptyAction}
              className="mt-4 gap-2 focus-visible:ring-ring"
              aria-label="Adjust filters to see more events"
            >
              <Filter className="h-4 w-4" aria-hidden />
              Adjust filters
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasError && (
        <ErrorBanner
          message={errorMessage ?? 'Failed to load events'}
          role="alert"
          className="rounded-lg"
        />
      )}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                <SortHeader
                  label="Time"
                  field="timestamp"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                <SortHeader
                  label="Source"
                  field="source"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                Speaker / Role
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                Audience
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                Excerpt
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                <SortHeader
                  label="Authority"
                  field="authority"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                Credibility / Risk
              </TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm w-12">
                <span className="sr-only">View raw</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeEvents.map((ev) => {
              const isHighlighted = ev.event_id === highlightedEventId
              const rawText = ev.raw_text ?? ''
              const snippet =
                rawText.length > SNIPPET_LENGTH
                  ? `${rawText.slice(0, SNIPPET_LENGTH)}…`
                  : rawText || '—'
              const speaker =
                ev.speaker_entity ?? ev.speaker_role
                  ? [ev.speaker_entity, ev.speaker_role].filter(Boolean).join(' · ')
                  : '—'
              const audience = ev.audience_class ?? '—'
              const timestamp =
                ev.original_timestamp ?? ev.ingestion_timestamp ?? ''
              const credibilityFlags = Array.isArray(ev.credibility_flags)
                ? ev.credibility_flags
                : []

              return (
                <TableRow
                  key={ev.event_id}
                  className={cn(
                    'transition-colors',
                    isHighlighted && 'bg-accent/10 border-l-2 border-l-accent'
                  )}
                >
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {timestamp
                      ? format(new Date(timestamp), 'MMM d, yyyy HH:mm')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getSourceBadgeVariant(ev.source ?? '')}
                      className="text-xs"
                    >
                      {ev.source ?? 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[140px] truncate">
                    {speaker}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {audience}
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate text-sm"
                    title={rawText}
                  >
                    {snippet}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {ev.authority_score != null
                        ? `${(ev.authority_score * 100).toFixed(0)}%`
                        : '—'}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({getAuthorityTier(ev.authority_score)})
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {ev.credibility_score != null ? (
                        <ScorePill
                          score={ev.credibility_score}
                          variant="credibility"
                          size="sm"
                          showLabel={false}
                        />
                      ) : null}
                      {ev.risk_score != null ? (
                        <ScorePill
                          score={ev.risk_score}
                          variant="risk"
                          size="sm"
                          showLabel={false}
                        />
                      ) : null}
                      {(ev.credibility_score == null && ev.risk_score == null) && (
                        <>
                          {credibilityFlags.slice(0, 2).map((f) => (
                            <Badge
                              key={f}
                              variant="success"
                              className="text-[10px] py-0"
                            >
                              {f}
                            </Badge>
                          ))}
                          {credibilityFlags.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </>
                      )}
                      {Array.isArray(ev.signals) && ev.signals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ev.signals.slice(0, 2).map((s) => (
                            <SignalBadge
                              key={s.id}
                              signal={s}
                              variant={s.type.includes('earnings') || s.type.includes('legal') ? 'risk' : 'credibility'}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewRaw(ev.raw_payload_id)}
                      aria-label="View raw payload"
                    >
                      <FileJson className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {(totalPages > 1 || (onPageSizeChange && total > 0)) && (
        <DataTablePagination
          currentPage={page + 1}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={(p) => onPageChange(Math.max(0, p - 1))}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}
