import { useState, useMemo, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SkipLinks } from '@/components/shared/SkipLinks'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { EmptyState } from '@/components/profile/EmptyState'
import {
  NarrativeCard,
  TopicLegend,
  PersistenceChart,
  NarrativeFilterBar,
  NarrativeDetailDrawer,
} from '@/components/narrative-explorer'
import type { CompanySelectorValue } from '@/components/company-view'
import type { TimeWindow } from '@/components/dashboard/TimeWindowPicker'
import { useNarratives, useNarrative } from '@/hooks/useNarratives'
import { useTopicsAggregate } from '@/hooks/useTopicsAggregate'
import { useSavedCompanies, useRecentCompanies } from '@/hooks/useCompanies'
import { FileText, Loader2, RefreshCw } from 'lucide-react'
import { ensureArray } from '@/lib/runtime-safe'

const DEFAULT_WINDOW: TimeWindow = {
  label: '1M',
  start: subDays(new Date(), 30),
  end: new Date(),
}

export function NarrativeExplorer() {
  const navigate = useNavigate()
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_WINDOW)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string | null>(null)

  const windowStart = format(timeWindow.start, 'yyyy-MM-dd')
  const windowEnd = format(timeWindow.end, 'yyyy-MM-dd')

  const { data: savedCompanies = [] } = useSavedCompanies()
  const { data: recentCompanies = [] } = useRecentCompanies()
  const safeSaved = ensureArray(savedCompanies)
  const safeRecent = ensureArray(recentCompanies)

  const recentList: CompanySelectorValue[] = useMemo(
    () => safeRecent.map((c) => ({ id: c.id, name: c.name, ticker: c.ticker })),
    [safeRecent]
  )
  const savedList: CompanySelectorValue[] = useMemo(
    () => safeSaved.map((c) => ({ id: c.id, name: c.name, ticker: c.ticker })),
    [safeSaved]
  )

  const narrativeParams = useMemo(
    () => ({
      company_id: selectedCompanyId ?? undefined,
      window_start: windowStart,
      window_end: windowEnd,
      limit: 20,
      offset: 0,
    }),
    [selectedCompanyId, windowStart, windowEnd]
  )

  const topicsParams = useMemo(
    () =>
      selectedCompanyId && windowStart && windowEnd
        ? { company_id: selectedCompanyId, window_start: windowStart, window_end: windowEnd }
        : null,
    [selectedCompanyId, windowStart, windowEnd]
  )

  const { data: narrativesData, isLoading: narrativesLoading, isError: narrativesError, error: narrativesErrorObj, refetch: refetchNarratives, isRefetching: narrativesRefetching } = useNarratives(narrativeParams)
  const { data: topicsData, isLoading: topicsLoading } = useTopicsAggregate(topicsParams)
  const { data: selectedNarrative, isLoading: narrativeDetailLoading, isError: narrativeDetailError, error: narrativeDetailErrorObj, refetch: refetchNarrativeDetail } = useNarrative(
    selectedNarrativeId ?? ''
  )

  const narratives = ensureArray(narrativesData?.items)
  const topics: import('@/types/topic-classification').TopicAggregate[] = ensureArray(
    topicsData?.items as import('@/types/topic-classification').TopicAggregate[] | null | undefined
  )

  const handleCompanyChange = useCallback((company: CompanySelectorValue) => {
    setSelectedCompanyId(company.id)
  }, [])

  const handleTimeWindowChange = useCallback((window: TimeWindow) => {
    setTimeWindow(window)
  }, [])

  const handleDrilldown = useCallback(
    (narrativeId: string) => {
      setSelectedNarrativeId(null)
      navigate(
        `/dashboard/drilldown/${narrativeId}?start=${windowStart}&end=${windowEnd}${
          selectedCompanyId ? `&company=${selectedCompanyId}` : ''
        }`
      )
    },
    [navigate, windowStart, windowEnd, selectedCompanyId]
  )

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null
    const c = safeSaved.find((x) => x.id === selectedCompanyId) ?? safeRecent.find((x) => x.id === selectedCompanyId)
    return c ? { id: c.id, name: c.name, ticker: c.ticker } : { id: selectedCompanyId, name: selectedCompanyId, ticker: undefined }
  }, [selectedCompanyId, safeSaved, safeRecent])

  return (
    <div className="space-y-8 animate-fade-in-up" role="main" aria-label="Narrative Explorer">
      <SkipLinks
        links={[
          { href: '#narrative-main', label: 'Skip to main content' },
          { href: '#topic-legend', label: 'Skip to topic legend' },
          { href: '#narratives-list', label: 'Skip to narratives' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Narrative Explorer</h1>
        <p className="text-sm text-foreground/80 mt-1">
          Topic classification and persistence across narratives
        </p>
      </div>

      <NarrativeFilterBar
        companyId={selectedCompanyId}
        companyName={selectedCompany?.name}
        onCompanyChange={handleCompanyChange}
        timeWindow={timeWindow}
        onTimeWindowChange={handleTimeWindowChange}
        recentCompanies={recentList}
        savedCompanies={savedList}
      />

      {narrativesError && (
        <section
          className="rounded-xl border border-border bg-card shadow-md p-4 space-y-3 transition-all duration-300"
          role="alert"
          aria-live="assertive"
          aria-label="Narratives load error"
        >
          <ErrorBanner
            message={narrativesErrorObj?.message ?? 'Failed to load narratives. Check your connection and try again.'}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchNarratives()}
              disabled={narrativesRefetching}
              className="gap-2 p-4 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={narrativesRefetching ? 'Retrying narratives' : 'Retry loading narratives'}
            >
              {narrativesRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              {narrativesRefetching ? 'Retrying…' : 'Retry'}
            </Button>
          </div>
        </section>
      )}

      <div id="topic-legend" className="flex flex-wrap items-center gap-2" tabIndex={-1} role="region" aria-label="Topic legend">
        <span className="text-sm font-medium text-foreground/80">Topics:</span>
        <TopicLegend topics={topics.map((t) => t.topic_label)} />
      </div>

      <div id="narrative-main" className="grid gap-8 lg:grid-cols-3" tabIndex={-1} aria-label="Narrative explorer main content">
        <div className="lg:col-span-2 space-y-6" role="region" aria-label="Top narratives list">
          <Card className="rounded-xl border border-border bg-card shadow-md" aria-labelledby="top-narratives-title">
            <CardHeader>
              <CardTitle id="top-narratives-title" className="text-xl">Top Narratives</CardTitle>
              <p className="text-sm text-foreground/80">
                Narratives with topic labels and persistence
              </p>
            </CardHeader>
            <CardContent>
              {narrativesLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              )}

              {!narrativesLoading && narratives.length === 0 && (
                <EmptyState
                  icon={<FileText className="h-6 w-6 text-foreground/80" aria-hidden />}
                  title="No narratives for this window"
                  description="Select a different time range or company. Ensure Supabase Edge Functions are deployed for topic classification."
                  action={
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedCompanyId(null)}
                        className="p-4 w-32 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="Clear company filter to show all narratives"
                      >
                        Clear filters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchNarratives()}
                        disabled={narrativesRefetching}
                        className="p-4 w-32 gap-2 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label={narrativesRefetching ? 'Refreshing narratives' : 'Refresh narratives'}
                      >
                        {narrativesRefetching ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : null}
                        {narrativesRefetching ? 'Refreshing…' : 'Refresh'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-4 gap-2 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        asChild
                        aria-label="Go to dashboard overview"
                      >
                        <Link to="/dashboard">Go to Dashboard</Link>
                      </Button>
                    </div>
                  }
                  className="py-12 text-center"
                />
              )}

              {!narrativesLoading && narratives.length > 0 && (
                <div
                  id="narratives-list"
                  className="grid gap-4 md:grid-cols-2"
                  role="list"
                  aria-label="Narrative cards"
                >
                  {(narratives ?? []).map((n) => (
                    <NarrativeCard
                      key={n.id ?? n.event_id ?? ''}
                      narrative={n}
                      onSelect={setSelectedNarrativeId}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6" role="region" aria-label="Topic persistence chart">
          {topicsLoading && (
            <Skeleton
              className="h-64 rounded-xl border border-border"
              aria-label="Loading persistence chart"
              aria-busy
            />
          )}
          {!topicsLoading && (
            <PersistenceChart data={topics} height={280} />
          )}
        </div>
      </div>

      <NarrativeDetailDrawer
        narrativeId={selectedNarrativeId}
        narrative={selectedNarrative as import('@/types/topic-classification').NarrativeEventWithTopics | null | undefined}
        isLoading={narrativeDetailLoading}
        error={narrativeDetailError ? (narrativeDetailErrorObj ?? new Error('Failed to load narrative')) : null}
        onRetry={refetchNarrativeDetail}
        onClose={() => setSelectedNarrativeId(null)}
        onDrilldown={handleDrilldown}
      />
    </div>
  )
}
