/**
 * Top-level error banner for API failures and non-field errors.
 */
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export interface GlobalErrorBannerProps {
  message?: string | null
  className?: string
}

export function GlobalErrorBanner({ message, className }: GlobalErrorBannerProps) {
  if (!message || typeof message !== 'string' || !message.trim()) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <p>{message}</p>
    </div>
  )
}
