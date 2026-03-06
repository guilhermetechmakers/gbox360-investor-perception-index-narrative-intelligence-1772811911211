import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CompanyViewLinkProps {
  companyId: string
  narrativeId?: string
  windowStart: string
  windowEnd: string
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  className?: string
}

export function CompanyViewLink({
  companyId,
  narrativeId,
  windowStart,
  windowEnd,
  children = 'Why did this move?',
  variant = 'default',
  className,
}: CompanyViewLinkProps) {
  const to = narrativeId
    ? `/dashboard/drilldown/${narrativeId}?companyId=${companyId}&start=${windowStart}&end=${windowEnd}`
    : `/dashboard/company/${companyId}?start=${windowStart}&end=${windowEnd}`

  return (
    <Button asChild variant={variant} className={className}>
      <Link to={to}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}
