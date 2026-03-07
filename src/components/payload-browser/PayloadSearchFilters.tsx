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
import type { PayloadSearchFilters as PayloadSearchFiltersType } from '@/types/admin'

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'news', label: 'NewsAPI' },
  { value: 'social', label: 'X / Twitter' },
  { value: 'transcript', label: 'Earnings transcripts' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'ingested', label: 'Ingested' },
  { value: 'failed', label: 'Failed' },
  { value: 'retried', label: 'Retried' },
  { value: 'pending', label: 'Pending' },
]

const PRESETS = [
  { label: 'Last 24h', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
]

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface PayloadSearchFiltersProps {
  onChangeFilters: (filters: PayloadSearchFiltersType) => void
  initialFilters?: Partial<PayloadSearchFiltersType>
}

export function PayloadSearchFilters({
  onChangeFilters,
  initialFilters = {},
}: PayloadSearchFiltersProps) {
  const [source, setSource] = useState(initialFilters?.source ?? 'all')
  const [ticker, setTicker] = useState(initialFilters?.ticker ?? '')
  const [batchId, setBatchId] = useState(initialFilters?.batchId ?? '')
  const [status, setStatus] = useState(initialFilters?.status ?? 'all')
  const [provenance, setProvenance] = useState(initialFilters?.provenance ?? '')
  const [dateFrom, setDateFrom] = useState(initialFilters?.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(initialFilters?.dateTo ?? '')

  const applyFilters = useCallback(() => {
    const filters: PayloadSearchFiltersType = {
      page: 1,
      pageSize: initialFilters?.pageSize ?? 20,
      ...(source && source !== 'all' ? { source } : {}),
      ...(ticker ? { ticker: ticker.trim() } : {}),
      ...(batchId ? { batchId: batchId.trim() } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(provenance ? { provenance: provenance.trim() } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }
    onChangeFilters(filters)
  }, [source, ticker, batchId, status, provenance, dateFrom, dateTo, onChangeFilters, initialFilters?.pageSize])

  const resetFilters = useCallback(() => {
    setSource('all')
    setTicker('')
    setBatchId('')
    setStatus('all')
    setProvenance('')
    setDateFrom('')
    setDateTo('')
    onChangeFilters({
      page: 1,
      pageSize: initialFilters?.pageSize ?? 20,
    })
  }, [onChangeFilters, initialFilters?.pageSize])

  const applyPreset = useCallback(
    (days: number) => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      setDateFrom(toDateString(from))
      setDateTo(toDateString(to))
    },
    []
  )

  useEffect(() => {
    applyFilters()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- apply on mount with defaults

  return (
    <Card className="card-surface transition-all duration-200" aria-label="Search filters for payloads">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <Label htmlFor="filter-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="filter-status" className="h-10">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-ticker">Ticker / Company</Label>
            <Input
              id="filter-ticker"
              placeholder="e.g. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-batch">Batch ID</Label>
            <Input
              id="filter-batch"
              placeholder="Ingestion batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-provenance">Provenance</Label>
            <Input
              id="filter-provenance"
              placeholder="e.g. source-id or chain ref"
              value={provenance}
              onChange={(e) => setProvenance(e.target.value)}
              className="h-10"
              aria-describedby="filter-provenance-desc"
            />
            <p id="filter-provenance-desc" className="text-xs text-muted-foreground">
              Filter by provenance chain or source reference
            </p>
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
                aria-label={`Set date range to ${p.label}`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={applyFilters}
            size="sm"
            className="h-10"
            aria-label="Apply filters"
          >
            Apply filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="h-10"
            aria-label="Reset filters"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
