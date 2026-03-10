import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanySuggest, useSavedCompanies, useSaveCompany, useRemoveSavedCompany } from '@/hooks/useCompanies'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, Calendar, Star, StarOff, Loader2, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanySearchResult } from '@/types/company'
import type { TimeWindow } from '@/components/dashboard/TimeWindowPicker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { format, subDays, startOfYear, subYears } from 'date-fns'

export interface CompanySelectorValue {
  id: string
  name: string
  ticker?: string
  market?: string
}

export type RecentCompany = CompanySelectorValue
export type SavedCompany = CompanySelectorValue

export interface TimeWindowPreset {
  label: string
  start: Date
  end: Date
}

const PRESETS: TimeWindowPreset[] = [
  { label: '1D', start: subDays(new Date(), 1), end: new Date() },
  { label: '1W', start: subDays(new Date(), 7), end: new Date() },
  { label: '1M', start: subDays(new Date(), 30), end: new Date() },
  { label: '3M', start: subDays(new Date(), 90), end: new Date() },
  { label: 'YTD', start: startOfYear(new Date()), end: new Date() },
  { label: '1Y', start: subYears(new Date(), 1), end: new Date() },
  { label: 'All', start: subYears(new Date(), 5), end: new Date() },
]

/** Highlight matched substring in query (case-insensitive) */
function HighlightMatch({
  text,
  query,
  className,
}: {
  text: string
  query: string
  className?: string
}) {
  if (!query || query.length < 2) {
    return <span className={className}>{text}</span>
  }
  const q = query.trim().toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return <span className={className}>{text}</span>
  return (
    <span className={className}>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5 font-medium bg-accent/20 text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  )
}

interface CompanySelectorProps {
  value: CompanySelectorValue | null
  onChange: (company: CompanySelectorValue) => void
  recentCompanies?: RecentCompany[]
  savedCompanies?: SavedCompany[]
  timeWindow: TimeWindow
  onTimeWindowChange: (window: TimeWindow) => void
  showSaveToggle?: boolean
  className?: string
}

export function CompanySelector({
  value,
  onChange,
  recentCompanies = [],
  savedCompanies = [],
  timeWindow,
  onTimeWindowChange,
  showSaveToggle = true,
  className,
}: CompanySelectorProps) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [customOpen, setCustomOpen] = useState(false)
  const [customStart, setCustomStart] = useState(format(timeWindow.start, 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(timeWindow.end, 'yyyy-MM-dd'))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [pendingSaveCompanyId, setPendingSaveCompanyId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 250)

  const { data: suggestData, isLoading } = useCompanySuggest(debouncedQuery, 1, 10)
  const suggestions = suggestData?.suggestions ?? []
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []
  const safeRecent = Array.isArray(recentCompanies) ? recentCompanies : []
  const safeSaved = Array.isArray(savedCompanies) ? savedCompanies : []

  const { data: savedFromApi = [] } = useSavedCompanies()
  const savedIds = useMemo(
    () => new Set((savedFromApi ?? []).map((c) => c.id)),
    [savedFromApi]
  )
  const saveCompany = useSaveCompany()
  const removeSaved = useRemoveSavedCompany()

  const handleSelect = useCallback(
    (company: CompanySearchResult) => {
      onChange({
        id: company.id,
        name: company.name,
        ticker: company.ticker,
      })
      setQuery(company.name)
      setIsOpen(false)
      setHighlightIndex(0)
    },
    [onChange]
  )

  const handleSaveToggle = useCallback(
    (e: React.MouseEvent, companyId: string) => {
      e.preventDefault()
      e.stopPropagation()
      setPendingSaveCompanyId(companyId)
      if (savedIds.has(companyId)) {
        removeSaved.mutate(companyId, {
          onSettled: () => setPendingSaveCompanyId(null),
        })
      } else {
        saveCompany.mutate(companyId, {
          onSettled: () => setPendingSaveCompanyId(null),
        })
      }
    },
    [savedIds, saveCompany, removeSaved]
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    queueMicrotask(() => setHighlightIndex(0))
  }, [debouncedQuery])

  useEffect(() => {
    if (value?.name) queueMicrotask(() => setQuery(value.name))
  }, [value?.name])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || safeSuggestions.length === 0) {
      if (e.key === 'Escape') setIsOpen(false)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, safeSuggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        handleSelect(safeSuggestions[highlightIndex])
        break
      case 'Escape':
        setIsOpen(false)
        break
      default:
        break
    }
  }

  const handlePresetClick = (preset: TimeWindowPreset) => {
    onTimeWindowChange({
      start: preset.start,
      end: preset.end,
      label: preset.label,
    })
  }

  const handleCustomApply = () => {
    setValidationError(null)
    const startDate = new Date(customStart)
    const endDate = new Date(customEnd)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setValidationError('Please enter valid dates.')
      return
    }
    if (startDate > endDate) {
      setValidationError('Start date must be before or equal to end date.')
      return
    }
    if (endDate > new Date()) {
      setValidationError('End date cannot be in the future.')
      return
    }

    onTimeWindowChange({
      start: startDate,
      end: endDate,
      label: 'Custom',
    })
    setCustomOpen(false)
  }

  const showDropdown = isOpen && (query.length >= 2 || safeSuggestions.length > 0)
  const isCustom = timeWindow.label === 'Custom'
  const hasRecentOrSaved = safeRecent.length > 0 || safeSaved.length > 0

  return (
    <section className={cn('space-y-4', className)} aria-labelledby="company-selector-heading">
      <h2 id="company-selector-heading" className="sr-only">
        Company and time range selection
      </h2>
      <div ref={containerRef} className="relative" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/80"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search company..."
            className="pl-8 pr-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search for a company"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="company-suggestions"
            aria-activedescendant={
              showDropdown && safeSuggestions[highlightIndex]
                ? `suggestion-${highlightIndex}`
                : undefined
            }
          />
        </div>
        {showDropdown && (
          <ul
            id="company-suggestions"
            role="listbox"
            aria-label="Company suggestions"
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card py-1 shadow-md animate-fade-in-down"
          >
            {isLoading ? (
              <>
                <li className="px-4 py-4 flex items-center gap-3" role="status" aria-busy="true" aria-live="polite">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-foreground/80" aria-hidden />
                  <span className="text-sm text-foreground/80">Searching...</span>
                </li>
                {[1, 2, 3].map((i) => (
                  <li key={i} className="px-4 py-2 flex items-center gap-2">
                    <Skeleton className="h-4 w-8 rounded bg-muted" aria-hidden />
                    <Skeleton className="h-4 flex-1 max-w-[80%] rounded bg-muted" aria-hidden />
                  </li>
                ))}
              </>
            ) : safeSuggestions.length === 0 ? (
              <li
                className="flex flex-col items-center justify-center p-8 text-center"
                role="status"
                aria-live="polite"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground/80">
                  <SearchX className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-medium text-foreground">No companies found</p>
                <p className="mt-2 text-xs text-foreground/80">Try a different search term or check spelling.</p>
              </li>
            ) : (
              safeSuggestions.map((company, i) => (
                <li
                  key={company.id}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === highlightIndex}
                  className={cn(
                    'cursor-pointer px-4 py-2 text-sm transition-colors duration-150 flex items-center justify-between gap-2',
                    i === highlightIndex ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted'
                  )}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onClick={() => handleSelect(company)}
                >
                  <span>
                    <HighlightMatch text={company.name} query={debouncedQuery} className="font-medium" />
                    {company.ticker && (
                      <span className="ml-2 text-foreground/80">({company.ticker})</span>
                    )}
                  </span>
                  {showSaveToggle && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(e) => handleSaveToggle(e, company.id)}
                      disabled={saveCompany.isPending || removeSaved.isPending}
                      aria-label={savedIds.has(company.id) ? `Remove ${company.name} from saved` : `Save ${company.name}`}
                      aria-busy={pendingSaveCompanyId === company.id}
                    >
                      {pendingSaveCompanyId === company.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
                      ) : savedIds.has(company.id) ? (
                        <StarOff className="h-3.5 w-3.5 text-accent" aria-hidden />
                      ) : (
                        <Star className="h-3.5 w-3.5 text-foreground/80" aria-hidden />
                      )}
                    </Button>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {hasRecentOrSaved && (
        <div className="space-y-2">
          {safeRecent.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground/80 shrink-0">Recent:</span>
              {safeRecent.slice(0, 6).map((c) => (
                <Button
                  key={c.id}
                  variant={value?.id === c.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs rounded-full min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() =>
                    onChange({
                      id: c.id,
                      name: c.name,
                      ticker: c.ticker,
                    })
                  }
                  aria-pressed={value?.id === c.id}
                  aria-label={`Select ${c.name}`}
                >
                  {c.ticker ?? c.name.slice(0, 12)}
                </Button>
              ))}
            </div>
          )}
          {safeSaved.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground/80 shrink-0">Saved:</span>
              {safeSaved.slice(0, 6).map((c) => (
                <Button
                  key={c.id}
                  variant={value?.id === c.id ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs rounded-full min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() =>
                    onChange({
                      id: c.id,
                      name: c.name,
                      ticker: c.ticker,
                    })
                  }
                  aria-pressed={value?.id === c.id}
                  aria-label={`Select ${c.name}`}
                >
                  {c.ticker ?? c.name.slice(0, 12)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground/80">Time window:</span>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant={timeWindow.label === preset.label ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-4 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => handlePresetClick(preset)}
              aria-label={`Set time window to ${preset.label}`}
              aria-pressed={timeWindow.label === preset.label}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogTrigger asChild>
            <Button
              variant={isCustom ? 'default' : 'outline'}
              size="sm"
              className="h-8 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Select custom date range"
            >
              <Calendar className="h-3.5 w-3.5" />
              Custom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Custom date range</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value)
                    setValidationError(null)
                  }}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  aria-describedby={validationError ? 'custom-date-error' : undefined}
                  aria-invalid={!!validationError}
                  className={cn(validationError && 'border-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => {
                    setCustomEnd(e.target.value)
                    setValidationError(null)
                  }}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  aria-describedby={validationError ? 'custom-date-error' : undefined}
                  aria-invalid={!!validationError}
                  className={cn(validationError && 'border-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2')}
                />
              </div>
              {validationError && (
                <p id="custom-date-error" className="text-sm text-destructive" role="alert">
                  {validationError}
                </p>
              )}
              <Button onClick={handleCustomApply} aria-label="Apply custom date range" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
