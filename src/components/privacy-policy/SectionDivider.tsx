import { cn } from '@/lib/utils'

export interface SectionDividerProps {
  className?: string
  /** Optional aria-label for screen readers */
  'aria-label'?: string
}

/**
 * Lightweight visual divider for policy sections.
 * Provides consistent vertical rhythm between content blocks.
 */
export function SectionDivider({ className, 'aria-label': ariaLabel }: SectionDividerProps) {
  return (
    <hr
      role="separator"
      aria-label={ariaLabel}
      className={cn(
        'my-12 md:my-16 border-0 border-t border-border',
        'transition-opacity duration-200',
        className
      )}
    />
  )
}
