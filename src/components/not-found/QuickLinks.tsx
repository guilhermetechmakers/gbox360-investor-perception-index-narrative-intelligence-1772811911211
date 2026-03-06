import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface QuickLink {
  id: string
  label: string
  href: string
}

interface QuickLinksProps {
  links?: QuickLink[] | null
  className?: string
}

export function QuickLinks({ links, className }: QuickLinksProps) {
  const safeLinks = Array.isArray(links) ? links : []

  if (safeLinks.length === 0) return null

  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {safeLinks.map((link) => (
        <Link
          key={link.id}
          to={link.href}
          className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted hover:border-accent/30 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
