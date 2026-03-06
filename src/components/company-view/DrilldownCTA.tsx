import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, HelpCircle } from 'lucide-react'

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

export function DrilldownCTA({
  onClick,
  companyId,
  narrativeId = '',
  windowStart,
  windowEnd,
  provenanceId,
  ariaLabel = 'Go to drilldown to see why the IPI moved',
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

  return (
    <Button
      asChild
      size="lg"
      className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      aria-label={ariaLabel}
    >
      <Link
        to={drilldownUrl}
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2"
      >
        <HelpCircle className="h-5 w-5" />
        Why did this move?
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  )
}
