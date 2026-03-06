import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TIPS = [
  'Check your network connection',
  'Try again in a few moments',
  'Clear your browser cache if the issue persists',
] as const

interface TipsPanelProps {
  /** Optional class name */
  className?: string
}

/**
 * Non-intrusive tips strip with remediation suggestions and Contact Support action.
 */
export function TipsPanel({ className }: TipsPanelProps) {
  const tips = TIPS ?? []

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        className
      )}
    >
      {Array.isArray(tips) &&
        tips.map((tip, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {tip}
          </span>
        ))}
      <Link
        to="/about"
        className="inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Contact Support
      </Link>
    </div>
  )
}
