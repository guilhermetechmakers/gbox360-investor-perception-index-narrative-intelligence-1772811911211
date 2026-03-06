import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, HelpCircle } from 'lucide-react'

interface DrilldownCTAProps {
  onClick?: () => void
  companyId: string
  narrativeId?: string
  windowStart: string
  windowEnd: string
}

export function DrilldownCTA({
  onClick,
  companyId,
  narrativeId = '',
  windowStart,
  windowEnd,
}: DrilldownCTAProps) {
  const narrativeSegment = narrativeId || 'overview'
  const drilldownUrl = `/dashboard/drilldown/${narrativeSegment}?company=${companyId}&start=${windowStart}&end=${windowEnd}`

  return (
    <Button
      asChild
      size="lg"
      className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
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
