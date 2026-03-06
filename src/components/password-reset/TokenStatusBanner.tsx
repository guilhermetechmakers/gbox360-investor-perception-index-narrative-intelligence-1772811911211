import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { PasswordResetSupportLink } from './PasswordResetSupportLink'
import { cn } from '@/lib/utils'

export type TokenStatus = 'valid' | 'expired' | 'invalid' | 'checking' | 'unknown' | null

export interface TokenStatusBannerProps {
  status: TokenStatus
  reason?: string
  onRequestNewReset?: () => void
  className?: string
}

export function TokenStatusBanner({
  status,
  reason,
  onRequestNewReset,
  className,
}: TokenStatusBannerProps) {
  if (status === 'checking') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground',
          className
        )}
      >
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/30" />
        <span>Verifying reset link...</span>
      </div>
    )
  }

  if (!status || status === 'valid' || status === 'unknown') return null

  const isError = status === 'expired' || status === 'invalid'

  if (!isError) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'rounded-lg border p-4 flex gap-3',
        'border-destructive/50 bg-destructive/5',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium text-foreground">
          {status === 'expired'
            ? 'This reset link has expired'
            : 'This reset link is invalid'}
        </p>
        <p className="text-sm text-muted-foreground">
          {reason ??
            (status === 'expired'
              ? 'Password reset links expire after 1 hour for security. Request a new link below.'
              : 'The link may have been used already or is incorrect. Request a new reset link below.')}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            to="/forgot-password"
            onClick={onRequestNewReset}
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Request new reset link
          </Link>
          <span className="text-muted-foreground">·</span>
          <PasswordResetSupportLink variant="link" className="text-sm font-medium" />
          <span className="text-muted-foreground">·</span>
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export function TokenStatusValidBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-3 flex gap-3',
        className
      )}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
      <p className="text-sm text-muted-foreground">
        Your reset link is valid. Enter your new password below.
      </p>
    </div>
  )
}
