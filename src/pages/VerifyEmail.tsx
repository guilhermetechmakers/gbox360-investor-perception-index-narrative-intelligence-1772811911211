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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-16 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Hero / Confirmation area */}
        <div className="flex-1 w-full max-w-xl animate-fade-in-up">
          <div className="flex justify-center lg:justify-start mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
              aria-label="Home"
            >
              <Building2 className="h-8 w-8 text-primary" />
              Gbox360
            </Link>
          </div>
          <div className="space-y-6">
            <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Check your email to verify your account
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              We sent a verification link to{' '}
              <strong className="text-foreground">
                {displayEmail || 'your email'}
              </strong>
              . Click the link in the email to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don&apos;t see the email within a few minutes, check your
              spam folder. You can resend the verification email or change your
              address using the options on the right.
            </p>
          </div>
        </div>

        {/* Action panel */}
        <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-xl">Verification actions</CardTitle>
              <CardDescription>
                Manage your verification email and account
              </CardDescription>
              {status && status.status !== 'unknown' && (
                <div className="flex items-center gap-2 pt-2">
                  <StatusBadge status={status.status} />
                  {status.lastSentAt && (
                    <span className="text-xs text-muted-foreground">
                      Last sent:{' '}
                      {format(new Date(status.lastSentAt), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Having trouble?{' '}
                  <SupportLink className="font-medium" />
                </p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={displayEmail}
        requirePassword={false}
        onSuccess={handleChangeEmailSuccess}
      />
    </div>
  )
}
