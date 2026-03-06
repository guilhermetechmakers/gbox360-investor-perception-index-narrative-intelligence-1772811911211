import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNarrativeEvents, useRawPayload, useRequestExport } from '@/hooks/useIPI'
import { format } from 'date-fns'
import { FileJson, Download, ChevronLeft } from 'lucide-react'

const PAGE_SIZE = 10

export function Drilldown() {
  const { narrativeId } = useParams<{ narrativeId: string }>()
  const [searchParams] = useSearchParams()
  const companyId = searchParams.get('company') ?? ''
  const start = searchParams.get('start') ?? ''
  const end = searchParams.get('end') ?? ''

  const [page, setPage] = useState(0)
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [payloadModalId, setPayloadModalId] = useState<string | null>(null)

  const { data: eventsData, isLoading } = useNarrativeEvents(
    narrativeId ?? '',
    page,
    PAGE_SIZE,
    sourceFilter ? { source: sourceFilter } : undefined
  )
  const { data: rawPayload, isLoading: payloadLoading } = useRawPayload(
    payloadModalId ?? ''
  )
  const exportMutation = useRequestExport()

  const events = eventsData?.data ?? []
  const total = eventsData?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/dashboard/company/${companyId}?start=${start}&end=${end}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Why did this move?</h1>
          <p className="text-sm text-muted-foreground">
            Narrative events and raw payload traceability
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Events</CardTitle>
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value)
                  setPage(0)
                }}
              >
                <option value="">All sources</option>
                <option value="news">News</option>
                <option value="social">Social</option>
                <option value="transcript">Transcript</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportMutation.mutate({
                    companyId,
                    windowStart: start,
                    windowEnd: end,
                    format: 'both',
                  })
                }
                disabled={exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Audit export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!isLoading && events.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No events for this narrative in the selected window.
            </p>
          )}
          {!isLoading && events.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Excerpt</TableHead>
                    <TableHead>Authority</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.event_id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(ev.original_timestamp), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{ev.source}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ev.raw_text?.slice(0, 80)}…
                      </TableCell>
                      <TableCell>
                        {ev.authority_score != null
                          ? (ev.authority_score * 100).toFixed(0) + '%'
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPayloadModalId(ev.raw_payload_id)}
                        >
                          <FileJson className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages} · {total} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!payloadModalId} onOpenChange={() => setPayloadModalId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Raw payload</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-md border bg-muted/30 p-4 font-mono text-xs">
            {payloadLoading && <Skeleton className="h-32 w-full" />}
            {!payloadLoading && rawPayload != null && (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(rawPayload, null, 2)}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
