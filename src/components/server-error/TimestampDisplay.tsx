import { cn } from '@/lib/utils'

interface TimestampDisplayProps {
  /** ISO 8601 timestamp string */
  timestamp: string
  /** Optional className */
  className?: string
}

/**
 * Displays diagnostic timestamp in a readable format.
 */
export function TimestampDisplay({ timestamp, className }: TimestampDisplayProps) {
  const displayValue =
    typeof timestamp === 'string' && timestamp.length > 0
      ? timestamp
      : new Date().toISOString()

  let formatted = displayValue
  try {
    const d = new Date(displayValue)
    if (!Number.isNaN(d.getTime())) {
      formatted = d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    }
  } catch {
    // Fallback to raw value
  }

  return (
    <div className={cn('text-xs text-muted-foreground', className)}>
      <span className="font-medium">Generated:</span>{' '}
      <time dateTime={displayValue}>{formatted}</time>
    </div>
  )
}
