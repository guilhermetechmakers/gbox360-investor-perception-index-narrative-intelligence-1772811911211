import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, RotateCcw } from 'lucide-react'
import type { NarrativeEventListParams } from '@/types/narrative-event-canonical'

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'NewsAPI', label: 'NewsAPI' },
  { value: 'earnings_transcripts_batch', label: 'Earnings transcripts' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'api', label: 'API' },
]

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All platforms' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'unknown', label: 'Unknown' },
]

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All audiences' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'retail', label: 'Retail' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'general_public', label: 'General public' },
  { value: 'unknown', label: 'Unknown' },
]

const PRESETS = [
  { label: 'Last 24h', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
]

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface NarrativeEventFilterBarProps {
  onChangeFilters: (filters: NarrativeEventListParams) => void
  initialFilters?: Partial<NarrativeEventListParams>
}

export function NarrativeEventFilterBar({
  onChangeFilters,
  initialFilters = {},
}: NarrativeEventFilterBarProps) {
  const [company, setCompany] = useState(initialFilters?.company ?? '')
  const [source, setSource] = useState(initialFilters?.source ?? 'all')
  const [platform, setPlatform] = useState(initialFilters?.platform ?? 'all')
  const [audienceClass, setAudienceClass] = useState(initialFilters?.audience_class ?? 'all')
  const [dateFrom, setDateFrom] = useState(initialFilters?.start ?? '')
  const [dateTo, setDateTo] = useState(initialFilters?.end ?? '')

  const applyFilters = useCallback(() => {
    const filters: NarrativeEventListParams = {
      limit: initialFilters?.limit ?? 20,
      offset: 0,
      ...(company.trim() ? { company: company.trim() } : {}),
      ...(source && source !== 'all' ? { source } : {}),
      ...(platform && platform !== 'all' ? { platform } : {}),
      ...(audienceClass && audienceClass !== 'all' ? { audience_class: audienceClass } : {}),
      ...(dateFrom ? { start: `${dateFrom}T00:00:00Z` } : {}),
      ...(dateTo ? { end: `${dateTo}T23:59:59Z` } : {}),
    }
    onChangeFilters(filters)
  }, [company, source, platform, audienceClass, dateFrom, dateTo, onChangeFilters, initialFilters?.limit])

  const resetFilters = useCallback(() => {
    setCompany('')
    setSource('all')
    setPlatform('all')
    setAudienceClass('all')
    setDateFrom('')
    setDateTo('')
    onChangeFilters({
      limit: initialFilters?.limit ?? 20,
      offset: 0,
    })
  }, [onChangeFilters, initialFilters?.limit])

  const applyPreset = useCallback((days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    setDateFrom(toDateString(from))
    setDateTo(toDateString(to))
  }, [])

  useEffect(() => {
    applyFilters()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- apply on mount with defaults

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-company">Company / Ticker</Label>
            <Input
              id="filter-company"
              placeholder="e.g. AAPL"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-source">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="filter-source" className="h-10">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="filter-platform" className="h-10">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-audience">Audience class</Label>
            <Select value={audienceClass} onValueChange={setAudienceClass}>
              <SelectTrigger id="filter-audience" className="h-10">
                <SelectValue placeholder="All audiences" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-date-from">From</Label>
            <Input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 w-[140px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-date-to">To</Label>
            <Input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 w-[140px]"
            />
          </div>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.days}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p.days)}
                className="h-10"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={applyFilters} size="sm" className="h-10">
            Apply filters
          </Button>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-10">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
