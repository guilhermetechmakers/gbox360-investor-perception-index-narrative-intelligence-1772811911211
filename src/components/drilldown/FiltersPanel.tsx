import { useState } from 'react'
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
import { Filter, RotateCcw } from 'lucide-react'
import type { DrilldownFilters } from '@/types/drilldown'

interface FiltersPanelProps {
  filters: DrilldownFilters
  onApply: (filters: DrilldownFilters) => void
  onReset: () => void
  credibilityOptions?: string[]
  dateStart?: string
  dateEnd?: string
}

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

export function FiltersPanel({
  filters,
  onApply,
  onReset,
  credibilityOptions = ['reliable', 'unverified', 'management', 'repetition'],
  dateStart: initialDateStart,
  dateEnd: initialDateEnd,
}: FiltersPanelProps) {
  const [sourceType, setSourceType] = useState(filters.sourceType ?? 'all')
  const [authorityTier, setAuthorityTier] = useState(filters.authorityTier ?? 'all')
  const [dateStart, setDateStart] = useState(filters.dateStart ?? initialDateStart ?? '')
  const [dateEnd, setDateEnd] = useState(filters.dateEnd ?? initialDateEnd ?? '')
  const [credibilityFlags, setCredibilityFlags] = useState<string[]>(
    filters.credibilityFlags ?? []
  )

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

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Narrow events by source, authority, and date
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Source type</Label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label>Authority tier</Label>
          <Select value={authorityTier} onValueChange={setAuthorityTier}>
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label>Credibility flags</Label>
          <div className="flex flex-wrap gap-2">
            {credibilityOptions.map((flag) => (
              <div
                key={flag}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`cred-${flag}`}
                  checked={credibilityFlags.includes(flag)}
                  onCheckedChange={() => toggleCredibility(flag)}
                />
                <Label
                  htmlFor={`cred-${flag}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {flag}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              placeholder="Start"
            />
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              placeholder="End"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleApply} size="sm" className="flex-1">
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
