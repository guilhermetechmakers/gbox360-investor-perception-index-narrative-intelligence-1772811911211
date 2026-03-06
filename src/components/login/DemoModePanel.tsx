/**
 * Demo mode panel: explains limitations and provides single-click demo CTA.
 */
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlayCircle } from 'lucide-react'

const DEFAULT_LIMITATIONS = [
  'Read-only access to sample data',
  'No export or audit artifact generation',
  'Session expires after 30 minutes',
]

export interface DemoModePanelProps {
  onStartDemo: () => void
  demoLimitations?: string[]
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function DemoModePanel({
  onStartDemo,
  demoLimitations = DEFAULT_LIMITATIONS,
  disabled = false,
  isLoading = false,
  className,
}: DemoModePanelProps) {
  const list = Array.isArray(demoLimitations) ? demoLimitations : DEFAULT_LIMITATIONS

  return (
    <div
      id="demo-panel"
      className={cn(
        'rounded-xl border border-border bg-muted/30 p-5 transition-all duration-200',
        'hover:shadow-card hover:border-accent/30',
        className
      )}
      role="region"
      aria-labelledby="demo-panel-title"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-accent/10 p-2">
          <PlayCircle className="h-6 w-6 text-accent" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            id="demo-panel-title"
            className="text-base font-semibold text-foreground"
          >
            Try Demo Mode
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore Gbox360 with limited access—no account required.
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {(list ?? []).map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 w-full sm:w-auto"
            onClick={onStartDemo}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            aria-label="Start demo mode"
          >
            {isLoading ? 'Starting...' : 'Start Demo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
