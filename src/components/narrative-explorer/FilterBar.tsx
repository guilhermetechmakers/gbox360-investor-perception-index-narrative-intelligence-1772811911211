/**
 * FilterBar - Company selector, time window picker, authority weighting toggle
 * Used in Narrative Explorer
 */
import { CompanySelector, type CompanySelectorValue } from '@/components/company-view'
import { TimeWindowPicker, type TimeWindow } from '@/components/dashboard/TimeWindowPicker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FilterBarProps {
  company: CompanySelectorValue | null
  onCompanyChange: (company: CompanySelectorValue) => void
  timeWindow: TimeWindow
  onTimeWindowChange: (window: TimeWindow) => void
  recentCompanies?: CompanySelectorValue[]
  savedCompanies?: CompanySelectorValue[]
  authorityWeighting?: boolean
  onAuthorityWeightingChange?: (enabled: boolean) => void
  className?: string
}

export function FilterBar({
  company,
  onCompanyChange,
  timeWindow,
  onTimeWindowChange,
  recentCompanies = [],
  savedCompanies = [],
  authorityWeighting = true,
  onAuthorityWeightingChange,
  className,
}: FilterBarProps) {
  const safeRecent = Array.isArray(recentCompanies) ? recentCompanies : []
  const safeSaved = Array.isArray(savedCompanies) ? savedCompanies : []

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-border bg-card p-4',
        className
      )}
      role="region"
      aria-label="Filters"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1">
          <CompanySelector
            value={company}
            onChange={onCompanyChange}
            recentCompanies={safeRecent}
            savedCompanies={safeSaved}
            timeWindow={timeWindow}
            onTimeWindowChange={onTimeWindowChange}
          />
        </div>
        <div className="flex items-center gap-4">
          <TimeWindowPicker value={timeWindow} onChange={onTimeWindowChange} />
          {onAuthorityWeightingChange && (
            <div className="flex items-center gap-2">
              <Switch
                id="authority-weighting"
                checked={authorityWeighting}
                onCheckedChange={onAuthorityWeightingChange}
                aria-label="Apply authority weighting"
              />
              <Label htmlFor="authority-weighting" className="text-sm text-muted-foreground">
                Authority weighting
              </Label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
