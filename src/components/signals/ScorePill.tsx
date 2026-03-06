/**
 * ScorePill - numeric score display with color ramp (0–1 scale)
 */
import { cn } from '@/lib/utils'

interface ScorePillProps {
  score: number | null | undefined
  label?: string
  variant?: 'credibility' | 'risk'
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
}

function clampScore(n: number | null | undefined): number {
  if (n == null || Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, Number(n)))
}

export function ScorePill({
  score,
  label,
  variant = 'credibility',
  size = 'md',
  className,
  showLabel = true,
}: ScorePillProps) {
  const value = clampScore(score)
  const pct = (value * 100).toFixed(0)

  const isCredibility = variant === 'credibility'
  const colorClass =
    value >= 0.7
      ? isCredibility
        ? 'bg-success/20 text-success border-success/40'
        : 'bg-destructive/20 text-destructive border-destructive/40'
      : value >= 0.4
        ? isCredibility
          ? 'bg-accent/15 text-accent border-accent/30'
          : 'bg-destructive/10 text-destructive/90 border-destructive/30'
        : isCredibility
          ? 'bg-muted text-muted-foreground border-border'
          : 'bg-muted text-muted-foreground border-border'

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium tabular-nums transition-all duration-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)] focus-visible:ring-offset-2',
        sizeClass,
        colorClass,
        className
      )}
      aria-label={label ? `${label}: ${pct}%` : `Score: ${pct}%`}
      title={label ? `${label}: ${pct}%` : undefined}
    >
      {showLabel && label && <span className="mr-1.5 text-muted-foreground">{label}</span>}
      {pct}%
    </span>
  )
}
