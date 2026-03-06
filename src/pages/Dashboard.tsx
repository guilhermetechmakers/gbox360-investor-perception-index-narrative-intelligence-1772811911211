import { useState, useMemo, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type TimeWindow,
  IPIQuickCard,
  SavedCompaniesPane,
  type SavedCompanyWithScore,
  SystemStatusBanner,
} from '@/components/dashboard'
import {
  CompanySelector,
  type CompanySelectorValue,
} from '@/components/company-view'
import { useSavedCompanies, useRecentCompanies, useSaveCompany, useRemoveSavedCompany } from '@/hooks/useCompanies'
import { useDashboardCards, useCalculateIPI } from '@/hooks/useIPI'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DEFAULT_WINDOW: TimeWindow = {
  label: '1M',
  start: subDays(new Date(), 30),
  end: new Date(),
}

export function Dashboard() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(DEFAULT_WINDOW)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  const windowStart = format(timeWindow.start, 'yyyy-MM-dd')
  const windowEnd = format(timeWindow.end, 'yyyy-MM-dd')

  const { data: saved = [], isLoading: savedLoading } = useSavedCompanies()
  const { data: recent = [] } = useRecentCompanies()
  const saveCompany = useSaveCompany()
  const removeSaved = useRemoveSavedCompany()
  const companyIds = useMemo(() => (saved ?? []).map((c) => c.id), [saved])
  const calculateIPI = useCalculateIPI()
  const { data: cards = [], isLoading: cardsLoading, refetch: refetchCards } = useDashboardCards(
    companyIds,
    windowStart,
    windowEnd
  )
  const { data: systemStatus, refetch: refetchStatus } = useSystemStatus()

  const safeCards = Array.isArray(cards) ? cards : []
  const safeSaved = Array.isArray(saved) ? saved : []
  const safeRecent = Array.isArray(recent) ? recent : []
  const savedIds = useMemo(() => new Set(safeSaved.map((c) => c.id)), [safeSaved])

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

  const selectedCompany: CompanySelectorValue | null = useMemo(() => {
    if (!selectedCompanyId) return null
    const c = safeSaved.find((x) => x.id === selectedCompanyId) ?? safeRecent.find((x) => x.id === selectedCompanyId)
    return c ? { id: c.id, name: c.name, ticker: c.ticker } : null
  }, [selectedCompanyId, safeSaved, safeRecent])

  const recentList: CompanySelectorValue[] = useMemo(
    () => safeRecent.map((c) => ({ id: c.id, name: c.name, ticker: c.ticker })),
    [safeRecent]
  )
  const savedList: CompanySelectorValue[] = useMemo(
    () => safeSaved.map((c) => ({ id: c.id, name: c.name, ticker: c.ticker })),
    [safeSaved]
  )

  const handleCompanyChange = useCallback(
    (company: CompanySelectorValue) => {
      setSelectedCompanyId(company.id)
      if (!savedIds.has(company.id)) {
        saveCompany.mutate(company.id, {
          onSuccess: () => refetchCards(),
        })
      }
    },
    [savedIds, saveCompany, refetchCards]
  )

  const handleSelectCompany = useCallback((company: SavedCompanyWithScore) => {
    setSelectedCompanyId(company.id)
  }, [])

  const handleUnpin = useCallback(
    (companyId: string) => {
      removeSaved.mutate(companyId, {
        onSuccess: () => {
          refetchCards()
          if (selectedCompanyId === companyId) setSelectedCompanyId(null)
        },
      })
    },
    [removeSaved, refetchCards, selectedCompanyId]
  )

  const handleRetryStatus = useCallback(() => {
    refetchStatus()
  }, [refetchStatus])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {selectedCompanyId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                calculateIPI.mutate({
                  companyId: selectedCompanyId,
                  windowStart,
                  windowEnd,
                  topN: 3,
                })
              }
              disabled={calculateIPI.isPending}
              className="gap-2"
            >
              {calculateIPI.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Calculate IPI
            </Button>
          )}
        </div>
        <CompanySelector
          value={selectedCompany}
          onChange={handleCompanyChange}
          recentCompanies={recentList}
          savedCompanies={savedList}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          showSaveToggle
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">

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
