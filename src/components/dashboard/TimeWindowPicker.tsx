import { useState } from 'react'
import { format, subDays, startOfYear } from 'date-fns'
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
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeWindow {
  start: Date
  end: Date
  label: string
}

const PRESETS: { label: string; getValue: () => { start: Date; end: Date } }[] = [
  { label: '1D', getValue: () => ({ start: subDays(new Date(), 1), end: new Date() }) },
  { label: '1W', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: '1M', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: '3M', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  {
    label: 'YTD',
    getValue: () => ({ start: startOfYear(new Date()), end: new Date() }),
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

  const isCustom = value.label === 'Custom'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-1 rounded-md border border-border p-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={value.label === preset.label ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="h-8 px-3 text-xs"
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
              <Label htmlFor="start-date">Start date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={today}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={today}
              />
            </div>
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            <Button onClick={handleCustomApply}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
