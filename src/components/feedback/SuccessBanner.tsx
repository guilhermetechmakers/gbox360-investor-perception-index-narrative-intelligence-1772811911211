import * as React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SuccessBannerProps {
  /** Success message - string or ReactNode */
  message: string | React.ReactNode
  /** Optional label for the action button */
  actionLabel?: string
  /** Called when the action button is clicked */
  onAction?: () => void
  /** Called when the banner is dismissed */
  onClose?: () => void
  /** Additional class names */
  className?: string
}

export function SuccessBanner({
  message,
  actionLabel,
  onAction,
  onClose,
  className,
}: SuccessBannerProps) {
  const safeMessage =
    typeof message === 'string' || React.isValidElement(message)
      ? message
      : 'Operation completed successfully'
  const hasAction = typeof actionLabel === 'string' && actionLabel.length > 0 && typeof onAction === 'function'

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-card',
        'animate-fade-in',
        className
      )}
    >
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-success"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{safeMessage}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="rounded-full"
          >
            {actionLabel}
          </Button>
        )}
        {typeof onClose === 'function' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
