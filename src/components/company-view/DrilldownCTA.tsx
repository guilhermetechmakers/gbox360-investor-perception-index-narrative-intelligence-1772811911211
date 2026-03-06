import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrilldownCTAProps {
  onClick?: () => void
  companyId: string
  narrativeId?: string
  windowStart: string
  windowEnd: string
  provenanceId?: string
  /** Accessible label for the drilldown link (default: "Go to drilldown to see why the IPI moved") */
  ariaLabel?: string
}

const DEFAULT_ARIA_LABEL = 'Go to drilldown to see why the IPI moved'

export function DrilldownCTA({
  onClick,
  companyId,
  narrativeId = '',
  windowStart,
  windowEnd,
  provenanceId,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: DrilldownCTAProps) {
  const narrativeSegment = narrativeId || 'overview'
  const prov = provenanceId ?? `prov-${companyId}-${windowStart}-${windowEnd}`
  const params = new URLSearchParams({
    company: companyId,
    start: windowStart,
    end: windowEnd,
    provenance: prov,
  })
  const drilldownUrl = `/dashboard/drilldown/${narrativeSegment}?${params.toString()}`

  const isDisabled = !companyId?.trim()

  if (isDisabled) {
    return (
      <Button
        size="lg"
        disabled
        className={cn('w-full sm:w-auto', 'shadow-card')}
        aria-label={ariaLabel}
        aria-disabled="true"
      >
        <HelpCircle className="h-5 w-5" aria-hidden />
        <span>Why did this move?</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    )
  }

  return (
    <Button
      asChild
      size="lg"
      variant="default"
      className={cn(
        'w-full sm:w-auto',
        'shadow-card transition-shadow duration-200',
        'hover:shadow-card-hover hover:scale-[1.02]'
      )}
      aria-label={ariaLabel}
    >
      <Link
        to={drilldownUrl}
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2"
        aria-label={ariaLabel}
      >
        <HelpCircle className="h-5 w-5" aria-hidden />
        <span>Why did this move?</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Button>
  )
}
