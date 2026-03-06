import { cn } from '@/lib/utils'

export type ToSChipVariant = 'important' | 'note' | 'disclaimer'

export interface ToSChipProps {
  text: string
  variant?: ToSChipVariant
  className?: string
  'aria-label'?: string
}

const variantStyles: Record<ToSChipVariant, string> = {
  important:
    'bg-accent/10 text-accent border-accent/30',
  note:
    'bg-muted text-muted-foreground border-border',
  disclaimer:
    'bg-destructive/10 text-destructive border-destructive/30',
}

/**
 * Visual emphasis chip/badge for critical ToS clauses.
 * Uses accent color (#FF6B4A) for Important variant.
 */
export function ToSChip({
  text,
  variant = 'important',
  className,
  'aria-label': ariaLabel,
}: ToSChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-200',
        variantStyles[variant],
        className
      )}
      aria-label={ariaLabel ?? `${variant}: ${text}`}
      role="status"
    >
      {text}
    </span>
  )
}
