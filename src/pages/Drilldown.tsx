import { useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { SkipLinks } from '@/components/shared/SkipLinks'
import {
  NarrativeHeaderCard,
  NarrativeEventsTable,
  RawPayloadModal,
  TimelineReplay,
  FiltersPanel,
  DrilldownAuditExportPanel,
  ProvenancePanel,
  ProvenanceSignOffChips,
} from '@/components/drilldown'
import {
  useMovement,
  useNarrativeEvents,
  useRawPayload,
  useIPISnapshot,
  useProvenance,
} from '@/hooks/useIPI'
import type { DrilldownFilters } from '@/types/drilldown'
import type { Movement } from '@/types/drilldown'

const DEFAULT_PAGE_SIZE = 10

const AUTHORITY_TIER_MAP: Record<string, number> = {
  analyst: 0.66,
  media: 0.33,
  retail: 0,
}

export function Drilldown() {
  const { narrativeId } = useParams<{ narrativeId: string }>()
  const [searchParams] = useSearchParams()
  const companyId = searchParams.get('company') ?? ''
  const start = searchParams.get('start') ?? ''
  const end = searchParams.get('end') ?? ''
  const provenanceId = searchParams.get('provenance') ?? ''

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sortBy, setSortBy] = useState<'timestamp' | 'source' | 'authority'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [payloadModalId, setPayloadModalId] = useState<string | null>(null)
  const [currentReplayIndex, setCurrentReplayIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loop, setLoop] = useState(false)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [filters, setFilters] = useState<DrilldownFilters>({})

  const narrativeIdSafe = narrativeId ?? ''
  const isOverview = narrativeIdSafe === 'overview' || !narrativeIdSafe

  const { data: movementData } = useMovement(
    narrativeIdSafe,
    companyId || undefined,
    start || undefined,
    end || undefined
  )

  const { data: snapshot } = useIPISnapshot(companyId, start, end)
  const provenanceIdToFetch = provenanceId ? provenanceId : (snapshot?.provenance_id ?? '')
  const { data: auditProvenance, isLoading: provenanceLoading } = useProvenance(provenanceIdToFetch)

  const movement: Movement | null = useMemo(() => {
    const m = movementData ?? null
    if (m) return m
    if (isOverview || !narrativeIdSafe || !snapshot) return null
    const top = snapshot?.top_narratives ?? []
    const found = Array.isArray(top)
      ? top.find((n) => n.id === narrativeIdSafe)
      : null
    if (found) {
      return {
        movementId: found.id,
        narrativeTitle: found.label,
        persistenceScore: found.persistence ?? 0,
        contributionDelta: found.contribution ?? 0,
        currentIPI: snapshot?.score,
        events: null,
        calculationInputs: null,
      }
    }
    return {
      movementId: narrativeIdSafe,
      narrativeTitle: 'Narrative',
      persistenceScore: 0,
      contributionDelta: 0,
      events: null,
      calculationInputs: null,
    }
  }, [movementData, narrativeIdSafe, isOverview, snapshot])

  const apiFilters = useMemo(() => {
    const f: {
      source?: string
      authority_min?: number
      date_start?: string
      date_end?: string
      sort?: 'asc' | 'desc'
      sortBy?: 'timestamp' | 'source' | 'authority'
    } = {}
    if (filters.sourceType) f.source = filters.sourceType
    if (filters.authorityTier && String(filters.authorityTier) !== 'all') {
      const min = AUTHORITY_TIER_MAP[filters.authorityTier]
      if (min != null) f.authority_min = min
    }
    if (filters.dateStart) f.date_start = filters.dateStart
    if (filters.dateEnd) f.date_end = filters.dateEnd
    f.sort = sortOrder
    f.sortBy = sortBy
    return f
  }, [filters, sortOrder, sortBy])

  const { data: eventsData, isLoading: eventsLoading } = useNarrativeEvents(
    narrativeIdSafe,
    page,
    pageSize,
    apiFilters
  )

  const { data: rawPayload, isLoading: payloadLoading } = useRawPayload(
    payloadModalId ?? ''
  )

  const events = eventsData?.data ?? []
  const total = eventsData?.count ?? 0
  const safeEvents = Array.isArray(events) ? events : []

  const filteredByCredibility = useMemo(() => {
    const flags = filters.credibilityFlags ?? []
    if (flags.length === 0) return safeEvents
    return safeEvents.filter((ev) => {
      const evFlags = ev.credibility_flags ?? []
      return flags.some((f) => evFlags.includes(f))
    })
  }, [safeEvents, filters.credibilityFlags])

  const handleFiltersApply = useCallback((newFilters: DrilldownFilters) => {
    setFilters(newFilters)
    setPage(0)
    setCurrentReplayIndex(0)
  }, [])

  const handleFiltersReset = useCallback(() => {
    setFilters({})
    setPage(0)
    setCurrentReplayIndex(0)
  }, [])

  const handleSortChange = useCallback(
    (by: 'timestamp' | 'source' | 'authority', order: 'asc' | 'desc') => {
      setSortBy(by)
      setSortOrder(order)
      setPage(0)
    },
    []
  )

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }, [])

  const backUrl = `/dashboard/company/${companyId}?start=${start}&end=${end}`

  const selectedEventForModal = payloadModalId
    ? filteredByCredibility.find((e) => e.raw_payload_id === payloadModalId)
    : null
  const provenance = selectedEventForModal?.metadata as { documentId?: string; url?: string } | undefined

  return (
    <div className="space-y-8 animate-fade-in-up relative" role="main" aria-label="Drilldown — Why did this move?">
      <SkipLinks
        links={[
          { href: '#drilldown-main', label: 'Skip to main content' },
          { href: '#events-table', label: 'Skip to events table' },
          { href: '#filters-panel', label: 'Skip to filters' },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backUrl} aria-label="Back to Company View">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Why did this move?
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Traceable narrative events and raw payload provenance
            </p>
          </div>
        </div>
      </div>

      <NarrativeHeaderCard
        movement={movement}
        isLoading={!movement && !isOverview}
        sparklineData={(movement?.events ?? safeEvents)
          .slice(0, 10)
          .map((e) => e.authority_score ?? 0)
          .filter((v) => typeof v === 'number')}
      />
      <ProvenanceSignOffChips
        source={snapshot?.company_name ? 'IPI Snapshot' : undefined}
        modelVersion={auditProvenance?.weightsUsed ? 'v1 (provisional)' : undefined}
        ingestionTimestamp={auditProvenance?.timestamp ?? snapshot?.window_end}
      />

      <div id="drilldown-main" className="grid gap-8 lg:grid-cols-3" tabIndex={-1}>
        <div className="lg:col-span-2 space-y-6" aria-labelledby="events-heading">
          <Card className="card-surface" id="events-table">
            <CardHeader>
              <CardTitle id="events-heading">Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                NarrativeEvents with source, speaker, authority, and raw payload links
              </p>
            </CardHeader>
            <CardContent>
              <NarrativeEventsTable
                events={filteredByCredibility}
                isLoading={eventsLoading}
                page={page}
                totalPages={Math.max(1, Math.ceil(total / pageSize))}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                onViewRaw={(id) => setPayloadModalId(id)}
                highlightedEventId={
                  filteredByCredibility[currentReplayIndex]?.event_id ?? null
                }
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div id="filters-panel" tabIndex={-1}>
          <FiltersPanel
            filters={filters}
            onApply={handleFiltersApply}
            onReset={handleFiltersReset}
            dateStart={start}
            dateEnd={end}
          />
          </div>
          <TimelineReplay
            events={filteredByCredibility}
            currentIndex={currentReplayIndex}
            onIndexChange={setCurrentReplayIndex}
            isPlaying={isPlaying}
            onPlayPause={setIsPlaying}
            loop={loop}
            onLoopToggle={setLoop}
            onViewPayload={(id) => setPayloadModalId(id)}
            speed={replaySpeed}
            onSpeedChange={setReplaySpeed}
          />

          <ProvenancePanel
            provenance={auditProvenance ?? null}
            isLoading={provenanceLoading && !!provenanceIdToFetch}
          />
          <DrilldownAuditExportPanel
            movement={movement}
            events={filteredByCredibility}
            companyId={companyId}
            companyName={snapshot?.company_name}
            windowStart={start}
            windowEnd={end}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" asChild>
          <Link to={backUrl}>Back to Company View</Link>
        </Button>
      </div>

      <RawPayloadModal
        open={!!payloadModalId}
        onOpenChange={(open) => !open && setPayloadModalId(null)}
        payload={rawPayload}
        isLoading={payloadLoading}
        movementId={movement?.movementId}
        narrativeTitle={movement?.narrativeTitle}
        eventCount={filteredByCredibility.length}
        provenance={provenance ?? undefined}
      />
    </div>
  )
}
