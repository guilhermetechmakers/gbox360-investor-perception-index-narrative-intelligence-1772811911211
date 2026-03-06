import { useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { SkipLinks } from '@/components/shared/SkipLinks'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
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
import { NarrativeSignalList, IngestionLog } from '@/components/signals'
import {
  useMovement,
  useNarrativeEvents,
  useRawPayload,
  useIPISnapshot,
  useProvenance,
} from '@/hooks/useIPI'
import { useRecomputeSignals } from '@/hooks/useSignals'
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

  const { data: movementData, isLoading: movementLoading, isError: movementError, error: movementErr, refetch: refetchMovement } = useMovement(
    narrativeIdSafe,
    companyId || undefined,
    start || undefined,
    end || undefined
  )

  const { data: snapshot, isLoading: snapshotLoading, isError: snapshotError, error: snapshotErr, refetch: refetchSnapshot } = useIPISnapshot(companyId, start, end)
  const provenanceIdToFetch = provenanceId ? provenanceId : (snapshot?.provenance_id ?? '')
  const { data: auditProvenance, isLoading: provenanceLoading, isError: provenanceError, error: provenanceErr, refetch: refetchProvenance } = useProvenance(provenanceIdToFetch)

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

  const { data: eventsData, isLoading: eventsLoading, isError: eventsError, error: eventsErr, refetch: refetchEvents } = useNarrativeEvents(
    narrativeIdSafe,
    page,
    pageSize,
    apiFilters
  )

  const { data: rawPayload, isLoading: payloadLoading } = useRawPayload(
    payloadModalId ?? ''
  )
  const recomputeMutation = useRecomputeSignals()

  const events = eventsData?.data ?? []
  const total = eventsData?.count ?? 0
  const safeEvents = Array.isArray(events) ? events : []

  const filteredByCredibility = useMemo(() => {
    const flags = filters.credibilityFlags ?? []
    if (flags.length === 0) return safeEvents
    return safeEvents.filter((ev) => {
      const evFlags = Array.isArray(ev.credibility_flags) ? ev.credibility_flags : []
      return flags.some((f) => evFlags.includes(f))
    })
  }, [safeEvents, filters.credibilityFlags])

  const { credibilityScore, riskScore, aggregatedSignals } = useMemo(() => {
    const items = filteredByCredibility ?? []
    const withCred = items.filter((e) => typeof e.credibility_score === 'number')
    const withRisk = items.filter((e) => typeof e.risk_score === 'number')
    const avgCred =
      withCred.length > 0
        ? withCred.reduce((s, e) => s + (e.credibility_score ?? 0), 0) / withCred.length
        : null
    const avgRisk =
      withRisk.length > 0
        ? withRisk.reduce((s, e) => s + (e.risk_score ?? 0), 0) / withRisk.length
        : null
    const allSignals = items.flatMap((e) => Array.isArray(e.signals) ? e.signals : [])
    const byWeight = [...allSignals].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    return {
      credibilityScore: avgCred,
      riskScore: avgRisk,
      aggregatedSignals: byWeight.slice(0, 8),
    }
  }, [filteredByCredibility])

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

  const lastIngestionTimestamp = useMemo(() => {
    const items = filteredByCredibility ?? []
    if (items.length === 0) return null
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.ingestion_timestamp ?? 0).getTime() -
        new Date(a.ingestion_timestamp ?? 0).getTime()
    )
    return sorted[0]?.ingestion_timestamp ?? null
  }, [filteredByCredibility])

  const handleRecompute = useCallback(() => {
    recomputeMutation.mutate({
      window: start && end ? `${start}/${end}` : undefined,
    })
  }, [recomputeMutation, start, end])

  const apiError = useMemo(() => {
    if (movementError && movementErr) return { message: movementErr.message, refetch: refetchMovement }
    if (snapshotError && snapshotErr) return { message: snapshotErr.message, refetch: refetchSnapshot }
    if (provenanceError && provenanceErr) return { message: provenanceErr.message, refetch: refetchProvenance }
    if (eventsError && eventsErr) return { message: eventsErr.message, refetch: refetchEvents }
    return null
  }, [
    movementError,
    movementErr,
    snapshotError,
    snapshotErr,
    provenanceError,
    provenanceErr,
    eventsError,
    eventsErr,
    refetchMovement,
    refetchSnapshot,
    refetchProvenance,
    refetchEvents,
  ])

  const handleRetryAll = useCallback(() => {
    if (movementError) refetchMovement()
    if (snapshotError) refetchSnapshot()
    if (provenanceError) refetchProvenance()
    if (eventsError) refetchEvents()
  }, [
    movementError,
    snapshotError,
    provenanceError,
    eventsError,
    refetchMovement,
    refetchSnapshot,
    refetchProvenance,
    refetchEvents,
  ])

  const headerLoading = !isOverview && (movementLoading || (!!narrativeIdSafe && !movementData && !!companyId && snapshotLoading))
  const sidebarLoading = (snapshotLoading && !!companyId) || (provenanceLoading && !!provenanceIdToFetch)

  return (
    <div className="space-y-8 animate-fade-in-up relative" role="main" aria-label="Drilldown — Why did this move?">
      <SkipLinks
        links={[
          { href: '#drilldown-main', label: 'Skip to main content' },
          { href: '#events-table', label: 'Skip to events table' },
          { href: '#filters-panel', label: 'Skip to filters' },
        ]}
      />
      {apiError && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3" role="alert" aria-live="assertive">
          <ErrorBanner
            message={apiError.message ?? 'Unable to load drilldown data. Check your connection and try again.'}
            role="alert"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAll}
            aria-label="Retry loading drilldown data"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Retry
          </Button>
        </div>
      )}
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
        isLoading={headerLoading}
        sparklineData={(movement?.events ?? safeEvents)
          .slice(0, 10)
          .map((e) => e.authority_score ?? 0)
          .filter((v) => typeof v === 'number')}
        credibilityScore={credibilityScore}
        riskScore={riskScore}
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
          <div id="filters-panel" tabIndex={-1} role="region" aria-label="Filter events by source, authority, and date">
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
          {sidebarLoading && (
            <div className="space-y-2" role="status" aria-label="Loading">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          )}
          <NarrativeSignalList
            signals={aggregatedSignals}
            credibilityScore={credibilityScore ?? movement?.credibilityScore ?? undefined}
            riskScore={riskScore ?? movement?.riskScore ?? undefined}
            title="Credibility & risk signals"
          />
          <IngestionLog
            lastIngestionAt={lastIngestionTimestamp ?? snapshot?.timestamp ?? snapshot?.window_end ?? undefined}
            status={recomputeMutation.isSuccess ? 'success' : 'idle'}
            message={recomputeMutation.isSuccess ? `Re-scored ${recomputeMutation.data?.updated_count ?? 0} events` : undefined}
          />
          <ProvenancePanel
            provenance={auditProvenance ?? null}
            isLoading={provenanceLoading && !!provenanceIdToFetch}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecompute}
            disabled={recomputeMutation.isPending || !companyId}
            aria-label={recomputeMutation.isPending ? 'Re-scoring signals…' : 'Re-score narrative signals for the selected time window'}
          >
            {recomputeMutation.isPending ? 'Re-scoring…' : 'Re-score signals'}
          </Button>
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
          <Link to={backUrl} aria-label="Back to Company View">
            Back to Company View
          </Link>
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
