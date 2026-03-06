import { Button } from '@/components/ui/button'
import type { TimeWindow } from '@/components/dashboard/TimeWindowPicker'
import {
  CompanySelector,
  type CompanySelectorValue,
} from '@/components/company-view'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NarrativeFilterBarProps {
  companyId: string | null
  companyName?: string | null
  onCompanyChange: (company: CompanySelectorValue) => void
  timeWindow: TimeWindow
  onTimeWindowChange: (window: TimeWindow) => void
  recentCompanies?: CompanySelectorValue[]
  savedCompanies?: CompanySelectorValue[]
  showAuthorityToggle?: boolean
  authorityWeightingEnabled?: boolean
  onAuthorityWeightingToggle?: (enabled: boolean) => void
  className?: string
}

export function NarrativeFilterBar({
  companyId,
  companyName,
  onCompanyChange,
  timeWindow,
  onTimeWindowChange,
  recentCompanies = [],
  savedCompanies = [],
  showAuthorityToggle = false,
  authorityWeightingEnabled = true,
  onAuthorityWeightingToggle,
  className,
}: NarrativeFilterBarProps) {
  const selectedCompany: CompanySelectorValue | null = companyId
    ? { id: companyId, name: companyName ?? companyId, ticker: undefined }
    : null

  return (
    <div
      className={cn('flex flex-col gap-4 rounded-lg border border-border bg-card p-4', className)}
      role="region"
      aria-label="Filters"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" aria-hidden />
        <span>Filters</span>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex-1 min-w-0">
          <CompanySelector
            value={selectedCompany}
            onChange={onCompanyChange}
            recentCompanies={recentCompanies}
            savedCompanies={savedCompanies}
            timeWindow={timeWindow}
            onTimeWindowChange={onTimeWindowChange}
            showSaveToggle
          />
        </div>
        {showAuthorityToggle && onAuthorityWeightingToggle && (
          <Button
            variant={authorityWeightingEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => onAuthorityWeightingToggle(!authorityWeightingEnabled)}
            aria-pressed={authorityWeightingEnabled}
            aria-label="Toggle authority weighting"
          >
            Authority weighting {authorityWeightingEnabled ? 'on' : 'off'}
          </Button>
        )}
      </div>
    </div>
  )
}
