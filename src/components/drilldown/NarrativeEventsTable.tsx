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
import { format } from 'date-fns'
import { FileJson, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/runtime-safe'
import type { NarrativeEvent } from '@/types/narrative'
import type { SortByField, SortOrder } from '@/types/drilldown'

interface NarrativeEventsTableProps {
  events: NarrativeEvent[]
  isLoading?: boolean
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
}: NarrativeEventsTableProps) {
  const safeEvents = ensureArray(events)
  const totalPages = totalPagesProp ?? Math.max(1, Math.ceil(total / pageSize))
  const highlightedEventId =
    highlightedEventIdProp ??
    (typeof currentReplayIndex === 'number' && safeEvents[currentReplayIndex]
      ? safeEvents[currentReplayIndex].event_id
      : null)

  const getSourceBadgeVariant = (source: string) => {
    const s = (source ?? '').toLowerCase()
    if (s.includes('news')) return 'default'
    if (s.includes('social') || s.includes('twitter') || s.includes('x'))
      return 'secondary'
    if (s.includes('transcript')) return 'accent'
    return 'outline'
  }

  const getAuthorityTier = (score?: number) => {
    if (score == null) return '—'
    if (score >= 0.8) return 'Analyst'
    if (score >= 0.5) return 'Media'
    return 'Retail'
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (safeEvents.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No events for this narrative in the selected window.</p>
        {total > 0 && (
          <p className="text-xs mt-1">
            Try adjusting filters or viewing another page.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
                Credibility
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
                    <div className="flex flex-wrap gap-1">
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
