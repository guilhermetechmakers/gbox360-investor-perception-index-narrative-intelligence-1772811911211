import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { SkipLinks } from '@/components/shared/SkipLinks'
import { useIPISnapshot, useCompanyTimelineEvents, useCalculateIPI } from '@/hooks/useIPI'
import { useSavedCompanies, useRecentCompanies } from '@/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import {
  CompanySelector,
  IPISummaryPanel,
  TopNarrativesList,
  TimelineView,
  DrilldownCTA,
  AuditExportPanel,
  PeerSnapshotPanel,
  RawPayloadViewer,
  IPITimelineChart,
} from '@/components/company-view'
import type { CompanySelectorValue } from '@/components/company-view'
import type { TimeWindow } from '@/components/dashboard/TimeWindowPicker'
import type { IPIViewContext } from '@/types/company-view'

const DEFAULT_WINDOW: TimeWindow = {
  label: '1M',
  start: subDays(new Date(), 30),
  end: new Date(),
}

export function CompanyView() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')

  const [timeWindow, setTimeWindow] = useState<TimeWindow>(() => {
    if (startParam && endParam) {
      const start = new Date(startParam)
      const end = new Date(endParam)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return { start, end, label: 'Custom' }
      }
    }
    return DEFAULT_WINDOW
  })

  const windowStart = format(timeWindow.start, 'yyyy-MM-dd')
  const windowEnd = format(timeWindow.end, 'yyyy-MM-dd')

  useEffect(() => {
    if (startParam && endParam) {
      const start = new Date(startParam)
      const end = new Date(endParam)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        setTimeWindow({ start, end, label: 'Custom' })
      }
    }
  }, [startParam, endParam])

  const { data: snapshot, isLoading: snapshotLoading, refetch: refetchSnapshot } = useIPISnapshot(
    id ?? '',
    windowStart,
    windowEnd
  )

  const [lastProvenanceId, setLastProvenanceId] = useState<string | null>(null)
  const calculateMutation = useCalculateIPI()

  useEffect(() => {
    setLastProvenanceId(null)
  }, [id, windowStart, windowEnd])

  const narrativeIds = useMemo(
    () => (snapshot?.top_narratives ?? []).map((n) => n.id).filter(Boolean),
    [snapshot?.top_narratives]
  )

  const { data: timelineEvents = [] } = useCompanyTimelineEvents(narrativeIds)

  const { data: savedCompanies = [] } = useSavedCompanies()
  const { data: recentCompanies = [] } = useRecentCompanies()
  const safeSaved = Array.isArray(savedCompanies) ? savedCompanies : []
  const safeRecent = Array.isArray(recentCompanies) ? recentCompanies : []

  const selectedCompany: CompanySelectorValue | null = useMemo(() => {
    if (!snapshot) return null
    return {
      id: snapshot.company_id,
      name: snapshot.company_name,
    }
  }, [snapshot])

  const recentList: CompanySelectorValue[] = useMemo(
    () =>
      safeRecent.map((c) => ({
        id: c.id,
        name: c.name,
        ticker: c.ticker,
      })),
    [safeRecent]
  )

  const savedList: CompanySelectorValue[] = useMemo(
    () =>
      safeSaved.map((c) => ({
        id: c.id,
        name: c.name,
        ticker: c.ticker,
      })),
    [safeSaved]
  )

  const handleCompanyChange = useCallback(
    (company: CompanySelectorValue) => {
      navigate(`/dashboard/company/${company.id}?start=${windowStart}&end=${windowEnd}`)
    },
    [navigate, windowStart, windowEnd]
  )

  const handleTimeWindowChange = useCallback(
    (window: TimeWindow) => {
      setTimeWindow(window)
      const start = format(window.start, 'yyyy-MM-dd')
      const end = format(window.end, 'yyyy-MM-dd')
      setSearchParams({ start, end }, { replace: true })
    },
    [setSearchParams]
  )

  const [payloadModalId, setPayloadModalId] = useState<string | null>(null)

  const narrativesForList = useMemo(() => {
    const top = snapshot?.top_narratives ?? []
    return top.slice(0, 3).map((n) => ({
      narrativeId: n.id,
      name: n.label,
      contribution: n.contribution ?? 0,
      ...(n.event_count != null && { authority: `~${n.event_count} events` }),
    }))
  }, [snapshot?.top_narratives])

  const timelineData = useMemo(() => {
    const score = snapshot?.score
    if (typeof score !== 'number') return []
    return [
      { date: windowStart, value: score },
      { date: windowEnd, value: score },
    ]
  }, [snapshot?.score, windowStart, windowEnd])

  const viewContext: IPIViewContext = useMemo(
    () => ({
      companyId: snapshot?.company_id ?? id ?? '',
      companyName: snapshot?.company_name,
      windowStart,
      windowEnd,
      ipi: snapshot?.score,
      delta: snapshot?.percent_change,
      direction: snapshot?.direction,
      breakdown: snapshot?.breakdown,
      narratives: narrativesForList,
      events: timelineEvents,
      timestamp: snapshot?.window_end,
    }),
    [
      snapshot,
      id,
      windowStart,
      windowEnd,
      narrativesForList,
      timelineEvents,
    ]
  )

  const isLoading = snapshotLoading

  if (isLoading && !snapshot) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-[10px]" />
          <Skeleton className="h-64 rounded-[10px]" />
        </div>
        <Skeleton className="h-48 rounded-[10px]" />
      </div>
    )
  }

  if (!id) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No company selected. Select a company from the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up relative" role="main" aria-label="Company IPI Detail">
      <SkipLinks
        links={[
          { href: '#company-main', label: 'Skip to main content' },
          { href: '#ipi-summary', label: 'Skip to IPI summary' },
          { href: '#top-narratives', label: 'Skip to top narratives' },
        ]}
      />
      <div className="flex flex-col gap-4" aria-label="Company selector and time window">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {snapshot?.company_name ?? 'Company'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {windowStart} – {windowEnd}
            {snapshot?.weight_version && (
              <> · Weight version: {snapshot.weight_version}</>
            )}
          </p>
        </div>
        <CompanySelector
          value={selectedCompany}
          onChange={handleCompanyChange}
          recentCompanies={recentList}
          savedCompanies={savedList}
          timeWindow={timeWindow}
          onTimeWindowChange={handleTimeWindowChange}
        />
      </div>

      <div id="company-main" className="grid gap-8 lg:grid-cols-3" role="region" aria-label="IPI summary and narratives" tabIndex={-1}>
        <div className="lg:col-span-2 space-y-6" aria-label="IPI summary, top narratives, and timeline">
          <div className="grid gap-6 md:grid-cols-2">
            <div id="ipi-summary" tabIndex={-1}>
            <IPISummaryPanel
              ipiValue={snapshot?.score}
              direction={snapshot?.direction}
              delta={snapshot?.percent_change}
              topContributions={narrativesForList.map((n) => ({
                name: n.name,
                value: n.contribution,
              }))}
              breakdown={snapshot?.breakdown}
              timestamp={snapshot?.window_end}
            />
            </div>

            <div id="top-narratives" tabIndex={-1}>
            <TopNarrativesList
              narratives={narrativesForList}
              companyId={id}
              windowStart={windowStart}
              windowEnd={windowEnd}
              provenanceId={lastProvenanceId ?? snapshot?.provenance_id ?? ''}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                calculateMutation.mutate(
                  { companyId: id, windowStart, windowEnd, topN: 3 },
                  {
                    onSuccess: (data) => {
                      setLastProvenanceId(data.provenanceId)
                      refetchSnapshot()
                    },
                  }
                )
              }
              disabled={calculateMutation.isPending}
            >
              {calculateMutation.isPending ? 'Calculating…' : 'Recalculate IPI'}
            </Button>
            <DrilldownCTA
              companyId={id}
              narrativeId={narrativesForList[0]?.narrativeId}
              windowStart={windowStart}
              windowEnd={windowEnd}
              provenanceId={lastProvenanceId ?? snapshot?.provenance_id}
            />
          </div>

          <IPITimelineChart
            data={timelineData}
            currentScore={snapshot?.score}
            height={200}
          />

          <TimelineView
            events={timelineEvents}
            onViewPayload={(rawPayloadId) => setPayloadModalId(rawPayloadId)}
          />
        </div>

        <div className="space-y-6">
          <AuditExportPanel viewContext={viewContext} status="ready" />

          <PeerSnapshotPanel
            windowStart={windowStart}
              windowEnd={windowEnd}
            />
            </div>
          </div>
      </div>

      <div className="rounded-[10px] border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          <strong>Provisional weights:</strong> Narrative 40%, Credibility 40%, Risk
          20%. Full methodology and provenance in About & Help.
        </p>
      </div>

      <RawPayloadViewer
        rawPayloadId={payloadModalId}
        onClose={() => setPayloadModalId(null)}
      />
    </div>
  )
}
