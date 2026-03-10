import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter, RotateCcw, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DrilldownFilters } from '@/types/drilldown'

/* Design tokens - 10–12px radius, subtle border (#E5E7EB), soft shadows, 150–220ms hovers */
const CARD_RADIUS = 'rounded-[10px]'
const CARD_BORDER = 'border border-border'
const CARD_SHADOW = 'shadow-card'
const CARD_TRANSITION = 'transition-all duration-200'

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'news', label: 'News' },
  { value: 'social', label: 'Social' },
  { value: 'transcript', label: 'Transcript' },
]

const AUTHORITY_OPTIONS = [
  { value: 'all', label: 'All tiers' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'media', label: 'Media' },
  { value: 'retail', label: 'Retail' },
]

interface FiltersPanelProps {
  filters: DrilldownFilters
  onApply: (filters: DrilldownFilters) => void
  onReset: () => void
  credibilityOptions?: string[]
  dateStart?: string
  dateEnd?: string
  /** When true, show skeleton placeholders for form fields */
  isLoading?: boolean
  /** When set, show error state with message */
  error?: string | null
}

export function FiltersPanel({
  filters,
  onApply,
  onReset,
  credibilityOptions = ['reliable', 'unverified', 'management', 'repetition'],
  dateStart: initialDateStart,
  dateEnd: initialDateEnd,
  isLoading = false,
  error = null,
}: FiltersPanelProps) {
  const [sourceType, setSourceType] = useState(filters.sourceType ?? 'all')
  const [authorityTier, setAuthorityTier] = useState(filters.authorityTier ?? 'all')
  const [dateStart, setDateStart] = useState(filters.dateStart ?? initialDateStart ?? '')
  const [dateEnd, setDateEnd] = useState(filters.dateEnd ?? initialDateEnd ?? '')
  const [credibilityFlags, setCredibilityFlags] = useState<string[]>(
    filters.credibilityFlags ?? []
  )

  const options = credibilityOptions ?? []
  const hasCredibilityOptions = options.length > 0

  const handleApply = () => {
    const start = dateStart.trim()
    const end = dateEnd.trim()
    if (start && end && start > end) {
      setDateStart(end)
      setDateEnd(start)
      onApply({
        ...(sourceType !== 'all' && { sourceType }),
        ...(authorityTier !== 'all' && { authorityTier }),
        ...(credibilityFlags.length > 0 && { credibilityFlags }),
        dateStart: end || undefined,
        dateEnd: start || undefined,
      } as DrilldownFilters)
      return
    }
    onApply({
      ...(sourceType !== 'all' && { sourceType }),
      ...(authorityTier !== 'all' && { authorityTier }),
      ...(credibilityFlags.length > 0 && { credibilityFlags }),
      dateStart: start || undefined,
      dateEnd: end || undefined,
    } as DrilldownFilters)
  }

  const handleReset = () => {
    setSourceType('all')
    setAuthorityTier('all')
    setDateStart(initialDateStart ?? '')
    setDateEnd(initialDateEnd ?? '')
    setCredibilityFlags([])
    onReset()
  }

  const toggleCredibility = (flag: string) => {
    setCredibilityFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    )
  }

  const dateError = useMemo(() => {
    const s = dateStart.trim()
    const e = dateEnd.trim()
    if (!s || !e) return null
    return s > e ? 'Start date must be before end date' : null
  }, [dateStart, dateEnd])

  if (error) {
    return (
      <Card
        className={cn(
          'card-surface',
          CARD_RADIUS,
          CARD_BORDER,
          CARD_SHADOW,
          CARD_TRANSITION
        )}
        role="region"
        aria-label="Filters panel - error"
      >
        <CardContent className="pt-6">
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'card-surface',
        CARD_RADIUS,
        CARD_BORDER,
        CARD_SHADOW,
        CARD_TRANSITION
      )}
      role="region"
      aria-labelledby="filters-panel-title"
      aria-describedby="filters-panel-description"
    >
      <CardHeader>
        <CardTitle id="filters-panel-title" className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" aria-hidden />
          Filters
        </CardTitle>
        <p id="filters-panel-description" className="text-sm text-muted-foreground">
          Narrow events by source, authority, and date
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source type */}
        <div className="space-y-2">
          <Label id="filter-source-type" htmlFor="filter-source-type-select">
            Source type
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" aria-hidden />
          ) : (
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger
                id="filter-source-type-select"
                aria-labelledby="filter-source-type"
                aria-label="Source type"
              >
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Authority tier */}
        <div className="space-y-2">
          <Label id="filter-authority-tier" htmlFor="filter-authority-tier-select">
            Authority tier
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" aria-hidden />
          ) : (
            <Select value={authorityTier} onValueChange={setAuthorityTier}>
              <SelectTrigger
                id="filter-authority-tier-select"
                aria-labelledby="filter-authority-tier"
                aria-label="Authority tier"
              >
                <SelectValue placeholder="All tiers" />
              </SelectTrigger>
              <SelectContent>
                {AUTHORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Credibility flags */}
        <div className="space-y-2">
          <Label id="filter-credibility-flags">Credibility flags</Label>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-24 rounded-md" aria-hidden />
              ))}
            </div>
          ) : !hasCredibilityOptions ? (
            <div
              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground"
              role="status"
              aria-label="No credibility flags available"
            >
              <Inbox className="h-4 w-4 shrink-0" aria-hidden />
              <span>No credibility flags available</span>
            </div>
          ) : (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="filter-credibility-flags"
            >
              {options.map((flag) => (
                <div
                  key={flag}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`cred-${flag}`}
                    checked={credibilityFlags.includes(flag)}
                    onCheckedChange={() => toggleCredibility(flag)}
                    aria-label={`Filter by ${flag}`}
                  />
                  <Label
                    htmlFor={`cred-${flag}`}
                    className="text-sm font-normal cursor-pointer text-foreground"
                  >
                    {flag}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="space-y-2">
          <Label id="filter-date-range" htmlFor="date-range-start">
            Date range
          </Label>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-md" aria-hidden />
              <Skeleton className="h-10 rounded-md" aria-hidden />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  id="date-range-start"
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  placeholder="Start"
                  aria-label="Start date"
                  aria-invalid={Boolean(dateError)}
                  aria-describedby={dateError ? 'date-range-error' : undefined}
                  className={cn(
                    dateError && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                <Input
                  id="date-range-end"
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  placeholder="End"
                  aria-label="End date"
                  aria-invalid={Boolean(dateError)}
                  aria-describedby={dateError ? 'date-range-error' : undefined}
                  className={cn(
                    dateError && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
              </div>
              {dateError && (
                <p
                  id="date-range-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  {dateError}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            size="sm"
            className="flex-1 transition-transform duration-150 hover:scale-[1.02] focus-visible:ring-ring"
            aria-label="Apply filters"
            disabled={isLoading}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1 transition-transform duration-150 hover:scale-[1.02] focus-visible:ring-ring border-border"
            aria-label="Reset filters"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
