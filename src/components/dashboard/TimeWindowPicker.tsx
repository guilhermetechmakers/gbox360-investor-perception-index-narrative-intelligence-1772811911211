import { useState, useEffect } from 'react'
import { format, subDays, startOfYear, subYears } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeWindow {
  start: Date
  end: Date
  label: string
}

const DEFAULT_PRESET = '1M'

const PRESETS: { label: string; getValue: () => { start: Date; end: Date } }[] = [
  { label: '1D', getValue: () => ({ start: subDays(new Date(), 1), end: new Date() }) },
  { label: '1W', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: '1M', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: '3M', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  {
    label: 'YTD',
    getValue: () => ({ start: startOfYear(new Date()), end: new Date() }),
  },
  { label: '1Y', getValue: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
  {
    label: 'All',
    getValue: () => ({
      start: subYears(new Date(), 5),
      end: new Date(),
    }),
  },
]

interface TimeWindowPickerProps {
  value: TimeWindow
  onChange: (window: TimeWindow) => void
  className?: string
}

export function TimeWindowPicker({ value, onChange, className }: TimeWindowPickerProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [customStart, setCustomStart] = useState(
    format(value.start, 'yyyy-MM-dd')
  )
  const [customEnd, setCustomEnd] = useState(format(value.end, 'yyyy-MM-dd'))
  const [validationError, setValidationError] = useState<string | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (customOpen) {
      setCustomStart(format(value.start, 'yyyy-MM-dd'))
      setCustomEnd(format(value.end, 'yyyy-MM-dd'))
      setValidationError(null)
    }
  }, [customOpen, value.start, value.end])

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    const { start, end } = preset.getValue()
    onChange({
      start,
      end,
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

    onChange({
      start: startDate,
      end: endDate,
      label: 'Custom',
    })
    setCustomOpen(false)
  }

  const handleReset = () => {
    const preset = PRESETS.find((p) => p.label === DEFAULT_PRESET)
    if (preset) {
      const { start, end } = preset.getValue()
      onChange({ start, end, label: DEFAULT_PRESET })
    }
    setCustomOpen(false)
  }

  const handleClearCustom = () => {
    setCustomStart(today)
    setCustomEnd(today)
    setValidationError(null)
  }

  const isCustom = value.label === 'Custom'
  const summaryLabel =
    value.label === 'Custom'
      ? `${format(value.start, 'MMM d, yyyy')} – ${format(value.end, 'MMM d, yyyy')}`
      : value.label

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span
        className="text-sm text-muted-foreground shrink-0"
        aria-live="polite"
      >
        {summaryLabel}
      </span>
      <div className="flex items-center gap-1 rounded-md border border-border p-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={value.label === preset.label ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="h-8 px-3 text-xs"
            aria-pressed={value.label === preset.label}
            aria-label={`Time window: ${preset.label}`}
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
            className="h-8 gap-1.5"
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="time-window-start-date">Start date</Label>
              <Input
                id="time-window-start-date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={today}
                aria-label="Start date for time window"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-window-end-date">End date</Label>
              <Input
                id="time-window-end-date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={today}
                aria-label="End date for time window"
              />
            </div>
            {validationError && (
              <p className="text-sm text-destructive" role="alert">
                {validationError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCustomApply}>Apply</Button>
              <Button
                variant="outline"
                onClick={handleClearCustom}
                aria-label="Clear custom date range"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5"
                aria-label="Reset to default time window"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
