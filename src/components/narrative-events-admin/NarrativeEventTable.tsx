import React, { useState } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { ChevronRight, FileJson, CalendarX2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/runtime-safe'
import type { CanonicalNarrativeEvent } from '@/types/narrative-event-canonical'

interface NarrativeEventTableProps {
  events: CanonicalNarrativeEvent[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  page: number
  total: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onViewDetail?: (event: CanonicalNarrativeEvent) => void
}

function provenanceSnippet(provenance: unknown): string {
  if (provenance == null || typeof provenance !== 'object') return '—'
  const p = provenance as Record<string, unknown>
  const parts: string[] = []
  if (p.operator_id) parts.push(`op: ${String(p.operator_id).slice(0, 8)}…`)
  if (p.ingest_system_id) parts.push(`sys: ${String(p.ingest_system_id).slice(0, 8)}…`)
  if (p.write_timestamp) parts.push(String(p.write_timestamp).slice(0, 19))
  return parts.length > 0 ? parts.join(' · ') : '—'
}

export function NarrativeEventTable({
  events,
  isLoading,
  isError,
  errorMessage,
  page,
  total,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
}: NarrativeEventTableProps) {
  const safeEvents = ensureArray(events)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (isLoading) {
    return (
      <Card
        className="rounded-xl border border-border shadow-card transition-shadow duration-200"
        aria-busy="true"
        aria-label="Loading narrative events"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2" role="status" aria-live="polite">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg bg-muted" />
            ))}
          </div>
          <p className="sr-only">Loading narrative events…</p>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card
        className="rounded-xl border border-border border-destructive/30 bg-card shadow-card"
        role="alert"
        aria-live="assertive"
        aria-label="Error loading narrative events"
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 px-4 sm:py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Could not load narrative events
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {errorMessage ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Check your connection and refresh the page, or adjust filters and try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (safeEvents.length === 0) {
    return (
      <Card
        className="rounded-xl border border-border bg-card shadow-card transition-shadow duration-200"
        aria-label="No narrative events"
      >
        <CardContent
          className="flex flex-col items-center justify-center gap-4 py-12 px-4 sm:py-16"
          role="status"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarX2 className="h-6 w-6" aria-hidden />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              No narrative events in the selected window
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Try adjusting filters, time range, or source to see results.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            You can also trigger a read-index replay to rebuild aggregates.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" role="region" aria-label="Narrative events table">
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card transition-shadow duration-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm w-8" aria-label="Expand row" />
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Event ID</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Source</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Platform</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Speaker / Role</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Audience</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Original time</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Ingestion time</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm">Provenance</TableHead>
              <TableHead scope="col" className="sticky top-0 bg-muted/50 backdrop-blur-sm w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeEvents.map((ev) => {
              const rawText = ev.raw_text ?? ''
              const speaker =
                [ev.speaker_entity, ev.speaker_role].filter(Boolean).join(' · ') || '—'
              const isExpanded = expandedId === ev.event_id

              return (
                <React.Fragment key={ev.event_id}>
                  <TableRow className="group hover:bg-muted/50 transition-colors">
                    <TableCell className="w-8 p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-7 w-7 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                          isExpanded && 'rotate-90'
                        )}
                        onClick={() => toggleExpand(ev.event_id)}
                        aria-label={isExpanded ? `Collapse row for event ${ev.event_id ?? 'unknown'}` : `Expand row for event ${ev.event_id ?? 'unknown'}`}
                        aria-expanded={isExpanded}
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate" title={ev.event_id}>
                        {ev.event_id?.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ev.source ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ev.platform ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm max-w-[140px] truncate">
                        {speaker}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ev.audience_class ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {ev.original_timestamp
                          ? format(new Date(ev.original_timestamp), 'MMM d, yyyy HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {ev.ingestion_timestamp
                          ? format(new Date(ev.ingestion_timestamp), 'MMM d, yyyy HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                        {provenanceSnippet(ev.provenance)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                          onClick={() => onViewDetail?.(ev)}
                          aria-label={`View details and raw payload for event ${ev.event_id ?? 'unknown'}`}
                        >
                          <FileJson className="h-4 w-4" aria-hidden />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${ev.event_id}-detail`}>
                        <TableCell colSpan={10} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Raw text</p>
                            <p className="text-sm whitespace-pre-wrap break-words">{rawText || '—'}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-2">Raw payload ID</p>
                            <p className="font-mono text-xs">{ev.raw_payload_id ?? '—'}</p>
                            {ev.authority_score != null && (
                              <>
                                <p className="text-xs font-medium text-muted-foreground mt-2">Authority score</p>
                                <p className="text-sm">{(ev.authority_score * 100).toFixed(1)}%</p>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {(total > pageSize || (onPageSizeChange && total > 0)) && (
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
