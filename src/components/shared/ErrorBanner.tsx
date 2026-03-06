/**
 * Error banner for user-facing API or validation errors.
 * Accessible, dismissible, and aligned with design system.
 */

import { AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  className?: string
  role?: 'alert' | 'status'
}

export function ErrorBanner({
  message,
  onDismiss,
  className,
  role = 'alert',
}: ErrorBannerProps) {
  if (!message?.trim()) return null
  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in-up',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <p className="flex-1 min-w-0">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 hover:bg-destructive/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
