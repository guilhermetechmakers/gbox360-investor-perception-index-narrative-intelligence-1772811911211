import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RawPayload } from '@/types/admin'

const STATUS_VARIANTS: Record<string, string> = {
  ingested: 'bg-success/20 text-success border-success/30',
  failed: 'bg-destructive/20 text-destructive border-destructive/30',
  retried: 'bg-accent/20 text-accent border-accent/30',
  pending: 'bg-muted text-muted-foreground',
}

interface PayloadListProps {
  payloads: RawPayload[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSelectPayloads: (ids: string[]) => void
  selectedIds: string[]
  onRowClick?: (payload: RawPayload) => void
  isLoading?: boolean
}

export function PayloadList({
  payloads = [],
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSelectPayloads,
  selectedIds = [],
  onRowClick,
  isLoading = false,
}: PayloadListProps) {
  const items = Array.isArray(payloads) ? payloads : []
  const selectedSet = useMemo(
    () => new Set(selectedIds ?? []),
    [selectedIds]
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectPayloads(items.map((p) => p.id))
    } else {
      onSelectPayloads([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectPayloads([...selectedSet, id])
    } else {
      onSelectPayloads([...selectedSet].filter((x) => x !== id))
    }
  }

  const allSelected = items.length > 0 && items.every((p) => selectedSet.has(p.id))

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Payloads</CardTitle>
        <span className="text-sm text-muted-foreground">
          {total} total
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No payloads found. Adjust filters or wait for ingestion.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(c) => handleSelectAll(c === true)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Batch ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => {
                    const status = (p.status ?? 'pending') as string
                    const statusClass = STATUS_VARIANTS[status] ?? STATUS_VARIANTS.pending
                    return (
                      <TableRow
                        key={p.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedSet.has(p.id) && 'bg-muted/50'
                        )}
                        onClick={() => onRowClick?.(p)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedSet.has(p.id)}
                            onCheckedChange={(c) => handleSelectOne(p.id, c === true)}
                            aria-label={`Select ${p.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate" title={p.id}>
                          {p.id}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.timestamp
                            ? new Date(p.timestamp).toLocaleString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.source ?? '—'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{p.ticker ?? '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('capitalize', statusClass)}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[100px] truncate" title={p.batchId ?? ''}>
                          {p.batchId ?? '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {items.map((p) => {
                const status = (p.status ?? 'pending') as string
                const statusClass = STATUS_VARIANTS[status] ?? STATUS_VARIANTS.pending
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onRowClick?.(p)}
                    onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(p)}
                    className={cn(
                      'rounded-lg border border-border p-4 transition-colors',
                      'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedSet.has(p.id) && 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Checkbox
                        checked={selectedSet.has(p.id)}
                        onCheckedChange={(c) => handleSelectOne(p.id, c === true)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${p.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs truncate text-muted-foreground">{p.id}</p>
                        <p className="text-sm font-medium mt-1">
                          {p.source ?? '—'} · {p.ticker ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.timestamp ? new Date(p.timestamp).toLocaleString() : '—'}
                        </p>
                        <Badge variant="outline" className={cn('mt-2 capitalize', statusClass)}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <DataTablePagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
