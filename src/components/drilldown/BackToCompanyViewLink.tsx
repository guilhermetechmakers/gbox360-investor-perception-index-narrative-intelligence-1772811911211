import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface BackToCompanyViewLinkProps {
  companyId: string
  windowStart?: string
  windowEnd?: string
  className?: string
}

export function BackToCompanyViewLink({
  companyId,
  windowStart = '',
  windowEnd = '',
  className,
}: BackToCompanyViewLinkProps) {
  const params = new URLSearchParams()
  if (windowStart) params.set('start', windowStart)
  if (windowEnd) params.set('end', windowEnd)
  const query = params.toString()
  const to = `/dashboard/company/${companyId}${query ? `?${query}` : ''}`

  return (
    <Button variant="ghost" size="sm" asChild className={className}>
      <Link to={to} className="inline-flex items-center gap-1">
        <ChevronLeft className="h-4 w-4" />
        Back to Company View
      </Link>
    </Button>
  )
}
