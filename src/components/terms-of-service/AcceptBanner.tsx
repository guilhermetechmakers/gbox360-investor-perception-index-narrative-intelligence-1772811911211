import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const TOS_ACCEPTED_KEY = 'gbox360_tos_accepted_v1'

export interface AcceptBannerProps {
  isVisible?: boolean
  onAccept?: () => void
  className?: string
}

/**
 * Optional banner for first-time ToS acceptance flow.
 * Persists acceptance in localStorage.
 */
export function AcceptBanner({
  isVisible: isVisibleProp = true,
  onAccept,
  className,
}: AcceptBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(TOS_ACCEPTED_KEY) : null
  const hasAccepted = stored === 'true'

  const isVisible =
    isVisibleProp && !dismissed && !hasAccepted

  const handleAccept = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOS_ACCEPTED_KEY, 'true')
    }
    setDismissed(true)
    onAccept?.()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Terms of Service acceptance"
      className={cn(
        'rounded-[10px] border border-border bg-card p-4 md:p-5',
        'shadow-card animate-fade-in-up',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-[1.6]">
          By continuing to use Gbox360, you acknowledge that you have read,
          understood, and agree to be bound by our{' '}
          <a
            href="#acceptance"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </a>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleAccept}
            className="min-h-[44px]"
            aria-label="I accept the Terms of Service"
          >
            I Accept
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="h-9 w-9 shrink-0"
            aria-label="Dismiss acceptance banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
