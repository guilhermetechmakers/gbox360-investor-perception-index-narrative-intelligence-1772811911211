import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { TosSection } from '@/types/terms-of-service'

export interface TocNavProps {
  sections: TosSection[]
  className?: string
  showHeading?: boolean
}

/**
 * Sticky Table of Contents navigation with scroll-spy.
 * Highlights current section as user scrolls; keyboard accessible.
 */
export function TocNav({ sections, className, showHeading = true }: TocNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const safeSections = Array.isArray(sections) ? sections : []
  const sectionIds = safeSections
    .map((s) => s?.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const headerOffset = 120
    let currentId: string | null = null

    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const id = sectionIds[i]
      if (!id) continue
      const el = document.getElementById(id)
      if (el && el.offsetTop - headerOffset <= scrollY) {
        currentId = id
        break
      }
    }

    if (!currentId && sectionIds.length > 0) {
      currentId = sectionIds[0] ?? null
    }

    setActiveId(currentId)
  }, [sectionIds])

  useEffect(() => {
    const run = () => handleScroll()
    queueMicrotask(run)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (safeSections.length === 0) return null

  return (
    <nav
      className={cn('sticky top-24', className)}
      aria-label="Table of contents"
    >
      {showHeading && (
        <h3 className="text-sm font-semibold text-foreground mb-4">
          On this page
        </h3>
      )}
      <ul className="space-y-2">
        {(safeSections ?? []).map((section) => {
          const id = section?.id ?? ''
          const heading = section?.heading ?? ''
          const isActive = activeId === id

          if (!id || !heading) return null

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                className={cn(
                  'block text-sm py-1.5 px-2 rounded-md transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'text-accent font-medium bg-accent/10 border-l-2 border-accent -ml-0.5 pl-2.5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                {heading}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
