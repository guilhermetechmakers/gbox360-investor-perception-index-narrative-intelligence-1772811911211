/**
 * Inline validation messages for form fields.
 * Announces errors to screen readers via aria-live.
 */
import { cn } from '@/lib/utils'

export interface ValidationMessagesProps {
  errors?: string[]
  id?: string
  className?: string
}

export function ValidationMessages({
  errors = [],
  id = 'validation-messages',
  className,
}: ValidationMessagesProps) {
  const list = Array.isArray(errors) ? errors : []
  if (list.length === 0) return null

  return (
    <ul
      id={id}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn('mt-1.5 space-y-1', className)}
    >
      {(list ?? []).map((msg, i) => (
        <li key={i} className="text-sm text-destructive">
          {msg}
        </li>
      ))}
    </ul>
  )
}
