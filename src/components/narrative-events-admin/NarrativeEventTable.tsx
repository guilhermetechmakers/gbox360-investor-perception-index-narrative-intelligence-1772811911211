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
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { ChevronRight, FileJson } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/runtime-safe'
import type { CanonicalNarrativeEvent } from '@/types/narrative-event-canonical'

interface NarrativeEventTableProps {
  events: CanonicalNarrativeEvent[]
  isLoading?: boolean
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
        <p>No narrative events in the selected window.</p>
        <p className="text-xs mt-1">Try adjusting filters or time range.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm w-8" />
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Event ID</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Source</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Platform</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Speaker / Role</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Audience</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Original time</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Ingestion time</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm">Provenance</TableHead>
              <TableHead className="sticky top-0 bg-muted/50 backdrop-blur-sm w-12">
                <span className="sr-only">View</span>
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
                        className={cn('h-7 w-7 transition-transform', isExpanded && 'rotate-90')}
                        onClick={() => toggleExpand(ev.event_id)}
                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                      >
                        <ChevronRight className="h-4 w-4" />
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
                          className="h-8 w-8"
                          onClick={() => onViewDetail?.(ev)}
                          aria-label="View raw payload"
                        >
                          <FileJson className="h-4 w-4" />
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
