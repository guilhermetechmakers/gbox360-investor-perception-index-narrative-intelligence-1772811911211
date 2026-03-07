import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChangeEmailModal,
  ResendVerificationButton,
  StatusBadge,
  SupportLink,
} from '@/components/verify-email'
import { LayoutWrapper } from '@/components/login/LayoutWrapper'
import { useVerificationStatus } from '@/hooks/useAuth'
import { Building2, Mail } from 'lucide-react'
import { format } from 'date-fns'

export function VerifyEmail() {
  const location = useLocation()
  const [changeEmailOpen, setChangeEmailOpen] = useState(false)
  const [emailFromChange, setEmailFromChange] = useState<string | null>(null)

  const stateEmail = (location.state as { email?: string } | null)?.email ?? ''
  const hasToken =
    typeof localStorage !== 'undefined' && !!localStorage.getItem('auth_token')

  const { data: status, refetch: refetchStatus } = useVerificationStatus(hasToken)

  const displayEmail =
    emailFromChange ?? stateEmail ?? (status?.email ?? '').trim() ?? ''

  const handleChangeEmailSuccess = (newEmail: string) => {
    setEmailFromChange(newEmail)
    refetchStatus()
  }

  return (
    <LayoutWrapper>
      <div className="w-full animate-fade-in-up">
        {/* Mobile logo */}
        <div className="flex justify-center mb-8 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:text-primary transition-colors"
            aria-label="Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            Gbox360
          </Link>
        </div>

        {/* Icon */}
        <div className="flex justify-center lg:justify-start mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Mail className="h-7 w-7 text-accent" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Check your email
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            We sent a verification link to{' '}
            <strong className="text-foreground">
              {displayEmail || 'your email'}
            </strong>
            . Click the link to activate your account.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Don&apos;t see it? Check your spam folder, or use the options below.
          </p>
        </div>

        {/* Status badge */}
        {status && status.status !== 'unknown' && (
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-muted/50 border border-border">
            <StatusBadge status={status.status} />
            {status.lastSentAt && (
              <span className="text-xs text-muted-foreground">
                Last sent: {format(new Date(status.lastSentAt), 'MMM d, h:mm a')}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <ResendVerificationButton
            email={displayEmail}
            onSuccess={() => refetchStatus()}
            className="w-full"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setChangeEmailOpen(true)}
            aria-label="Change email address"
          >
            Change email address
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-border space-y-3">
          <p className="text-sm text-muted-foreground">
            Having trouble?{' '}
            <SupportLink className="font-semibold text-accent" />
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="text-accent hover:underline font-semibold"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>

      <ChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={displayEmail}
        requirePassword={false}
        onSuccess={handleChangeEmailSuccess}
      />
    </LayoutWrapper>
  )
}
