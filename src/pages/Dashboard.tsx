import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CompanySearchBar,
  TimeWindowPicker,
  type TimeWindow,
  IPIQuickCard,
  SavedCompaniesPane,
  type SavedCompanyWithScore,
  SystemStatusBanner,
} from '@/components/dashboard'
import { useSavedCompanies, useSaveCompany, useRemoveSavedCompany } from '@/hooks/useCompanies'
import { useDashboardCards } from '@/hooks/useIPI'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { BarChart3 } from 'lucide-react'
import type { CompanySearchResult } from '@/types/company'

const DEFAULT_WINDOW: TimeWindow = {
  label: '1M',
  start: subDays(new Date(), 30),
  end: new Date(),
}

export function Dashboard() {
  const [searchParams] = useSearchParams()
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_WINDOW)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  const windowStart = format(timeWindow.start, 'yyyy-MM-dd')
  const windowEnd = format(timeWindow.end, 'yyyy-MM-dd')

  const { data: saved = [], isLoading: savedLoading } = useSavedCompanies()
  const saveCompany = useSaveCompany()
  const removeSaved = useRemoveSavedCompany()
  const companyIds = useMemo(() => (saved ?? []).map((c) => c.id), [saved])
  const { data: cards = [], isLoading: cardsLoading, refetch: refetchCards } = useDashboardCards(
    companyIds,
    windowStart,
    windowEnd
  )
  const { data: systemStatus, refetch: refetchStatus } = useSystemStatus()

  const safeCards = Array.isArray(cards) ? cards : []
  const safeSaved = Array.isArray(saved) ? saved : []

  const savedWithScores: SavedCompanyWithScore[] = useMemo(() => {
    return safeSaved.map((c) => {
      const card = safeCards.find((card) => card.company_id === c.id)
      return {
        ...c,
        score: card?.score,
        lastViewed: card?.window_end,
      }
    })
  }, [safeSaved, safeCards])

  const handleCompanySelect = useCallback(
    (company: CompanySearchResult) => {
      saveCompany.mutate(company.id, {
        onSuccess: () => {
          setSelectedCompanyId(company.id)
          refetchCards()
        },
      })
    },
    [saveCompany, refetchCards]
  )

  const handleSelectCompany = useCallback((company: SavedCompanyWithScore) => {
    setSelectedCompanyId(company.id)
  }, [])

  const handleUnpin = useCallback(
    (companyId: string) => {
      removeSaved.mutate(companyId, {
        onSuccess: () => refetchCards(),
      })
    },
    [removeSaved, refetchCards]
  )

  const handleRetryStatus = useCallback(() => {
    refetchStatus()
  }, [refetchStatus])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <TimeWindowPicker value={timeWindow} onChange={setTimeWindow} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CompanySearchBar
            onSelect={handleCompanySelect}
            placeholder="Search company to add..."
            className="max-w-md"
            initialQuery={searchParams.get('q') ?? ''}
          />

          {systemStatus && systemStatus.status !== 'ok' && (
            <SystemStatusBanner
              status={systemStatus}
              canRetry
              onRetry={handleRetryStatus}
            />
          )}

          {savedLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          )}

          {!savedLoading && safeSaved.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No saved companies yet</p>
                <p className="text-sm text-muted-foreground">
                  Search and save companies above to see IPI quick cards here.
                </p>
              </CardContent>
            </Card>
          )}

          {!savedLoading && safeSaved.length > 0 && (
            <>
              {cardsLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                  {safeSaved.map((c) => (
                    <Skeleton key={c.id} className="h-48 rounded-lg" />
                  ))}
                </div>
              )}
              {!cardsLoading && safeCards.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {safeCards.map((snap) => (
                    <IPIQuickCard
                      key={snap.company_id}
                      snapshot={snap}
                      windowStart={windowStart}
                      windowEnd={windowEnd}
                    />
                  ))}
                </div>
              )}
              {!cardsLoading && safeCards.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No IPI data for the selected window. Try another period.
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <SavedCompaniesPane
            savedCompanies={savedWithScores}
            onSelectCompany={handleSelectCompany}
            onUnpin={handleUnpin}
            selectedCompanyId={selectedCompanyId}
            windowStart={windowStart}
            windowEnd={windowEnd}
          />
        </div>
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Provisional weights:</strong> Narrative 40%, Credibility 40%, Risk 20%.
            Adjustable in Settings. All inputs and provenance are logged for audit.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
