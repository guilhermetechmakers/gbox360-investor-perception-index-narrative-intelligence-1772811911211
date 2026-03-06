/**
 * Narrative Events Admin (page_admin_003)
 * Admin interface for canonical narrative events: filter, list, detail drawer, replay.
 */
import { useState, useCallback } from 'react'
import {
  NarrativeEventFilterBar,
  NarrativeEventTable,
  NarrativeEventDetailDrawer,
  ReplayControlPanel,
} from '@/components/narrative-events-admin'
import {
  useNarrativeEventsList,
  useNarrativeEventReplay,
  useNarrativeEventReplayStatus,
} from '@/hooks/useNarrativeEvents'
import type { NarrativeEventListParams } from '@/types/narrative-event-canonical'
import type { CanonicalNarrativeEvent } from '@/types/narrative-event-canonical'
import { ensureArray } from '@/lib/runtime-safe'
import { toast } from 'sonner'

const DEFAULT_PAGE_SIZE = 20

export function NarrativeEventsAdmin() {
  const [filters, setFilters] = useState<NarrativeEventListParams>({
    limit: DEFAULT_PAGE_SIZE,
    offset: 0,
  })
  const [page, setPage] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<CanonicalNarrativeEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const listParams: NarrativeEventListParams = {
    ...filters,
    limit: filters.limit ?? DEFAULT_PAGE_SIZE,
    offset: page * (filters.limit ?? DEFAULT_PAGE_SIZE),
  }

  const { data: listData, isLoading: listLoading } = useNarrativeEventsList(listParams)
  const { data: replayStatus } = useNarrativeEventReplayStatus()
  const replayMutation = useNarrativeEventReplay()

  const items = ensureArray(listData?.items)
  const total = listData?.total ?? 0
  const pageSize = filters.limit ?? DEFAULT_PAGE_SIZE

  const handleFiltersChange = useCallback((next: NarrativeEventListParams) => {
    setFilters(next)
    setPage(0)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(0, newPage))
  }, [])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setFilters((prev) => ({ ...prev, limit: newSize, offset: 0 }))
    setPage(0)
  }, [])

  const handleViewDetail = useCallback((event: CanonicalNarrativeEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }, [])

  const handleTriggerReplay = useCallback(() => {
    replayMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res?.success) toast.success('Replay triggered')
        else toast.error(res?.message ?? 'Replay failed')
      },
      onError: () => toast.error('Failed to trigger replay'),
    })
  }, [replayMutation])

  const currentStatus = replayStatus?.status ?? 'idle'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Narrative Events
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and filter canonical narrative events. Trigger read-index replay to rebuild aggregates.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <NarrativeEventFilterBar
            onChangeFilters={handleFiltersChange}
            initialFilters={{ limit: pageSize }}
          />
          <NarrativeEventTable
            events={items}
            isLoading={listLoading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewDetail={handleViewDetail}
          />
        </div>
        <div>
          <ReplayControlPanel
            status={currentStatus}
            onTriggerReplay={handleTriggerReplay}
            isReplaying={replayMutation.isPending}
            errorMessage={replayStatus?.error_message ?? undefined}
            completedAt={replayStatus?.completed_at ?? undefined}
          />
        </div>
      </div>

      <NarrativeEventDetailDrawer
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
