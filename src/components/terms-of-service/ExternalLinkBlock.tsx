import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PolicyLink {
  label: string
  to: string
  external?: boolean
}

export interface ExternalLinkBlockProps {
  links?: PolicyLink[]
  className?: string
}

const DEFAULT_LINKS: PolicyLink[] = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Acceptable Use', to: '/terms#acceptable-use' },
  { label: 'About & Help', to: '/about' },
  { label: 'Contact Support', to: '/about#support' },
]

/**
 * Helper block for policy links (Privacy Policy, Acceptable Use, Support).
 * Opens external links in new tab with proper rel attributes.
 */
export function ExternalLinkBlock({
  links = DEFAULT_LINKS,
  className,
}: ExternalLinkBlockProps) {
  const safeLinks = Array.isArray(links) && links.length > 0 ? links : DEFAULT_LINKS

  return (
    <nav
      className={cn('flex flex-wrap gap-4', className)}
      aria-label="Related policy and support links"
    >
      {(safeLinks ?? []).map((link) => {
        const isExternal = link?.external ?? (link?.to?.startsWith('http') ?? false)
        const href = link?.to ?? '#'

        if (isExternal || href.startsWith('http')) {
          return (
            <a
              key={link?.label ?? href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 transition-colors"
            >
              {link?.label ?? 'Link'}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )
        }

        return (
          <Link
            key={link?.label ?? href}
            to={href}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 transition-colors"
          >
            {link?.label ?? 'Link'}
          </Link>
        )
      })}
    </nav>
  )
}
