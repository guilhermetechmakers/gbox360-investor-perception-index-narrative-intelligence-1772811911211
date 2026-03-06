/**
 * Skip links for accessibility - allow keyboard users to jump to main content areas.
 * Rendered at the top of the page, visible on focus.
 */

interface SkipLink {
  href: string
  label: string
}

interface SkipLinksProps {
  links: SkipLink[]
  className?: string
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  const safeLinks = Array.isArray(links) ? links : []
  return (
    <div
      className={`relative ${className ?? ''}`}
      role="navigation"
      aria-label="Skip links"
    >
      <div className="absolute left-4 top-4 flex flex-col gap-2 -translate-y-full focus-within:translate-y-0 focus-within:z-[100]">
        {safeLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md outline-none ring-2 ring-ring ring-offset-2 transition-transform text-sm font-medium w-fit"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
