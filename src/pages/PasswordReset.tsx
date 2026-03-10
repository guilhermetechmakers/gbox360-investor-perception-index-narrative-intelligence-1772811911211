import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  HelperTextBlock,
  PasswordField,
  PasswordResetSupportLink,
  TokenStatusBanner,
  TokenStatusValidBanner,
} from '@/components/password-reset'
import type { TokenStatus } from '@/components/password-reset'
import {
  useResetPasswordRequest,
  useResetPassword,
  usePasswordResetTokenStatus,
} from '@/hooks/useAuth'
import { isPasswordStrongEnough } from '@/lib/auth-validation'
import { LayoutWrapper } from '@/components/login/LayoutWrapper'
import { Building2, KeyRound, Loader2, Mail, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one symbol'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  })

type RequestForm = z.infer<typeof requestSchema>
type ResetForm = z.infer<typeof resetSchema>

function parseTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (token) return token
  const hash = window.location.hash
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
    return hashParams.get('token') ?? hashParams.get('access_token')
  }
  return null
}

function deriveTokenStatus(
  tokenStatusData: { valid: boolean; reason?: string } | null | undefined,
  isLoading: boolean,
  mutationError: TokenStatus | null
): TokenStatus {
  if (mutationError) return mutationError
  if (isLoading) return 'checking'
  if (tokenStatusData === null || tokenStatusData === undefined) return 'unknown'
  if (tokenStatusData.valid) return 'valid'
  if (tokenStatusData.reason?.toLowerCase().includes('expir')) return 'expired'
  return 'invalid'
}

export function PasswordReset() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') ?? parseTokenFromUrl()
  const token = tokenFromUrl
  const navigate = useNavigate()
  const [requested, setRequested] = useState(false)
  const [mutationTokenError, setMutationTokenError] = useState<TokenStatus>(null)

  const request = useResetPasswordRequest()
  const reset = useResetPassword()
  const { data: tokenStatusData, isLoading: tokenStatusLoading } =
    usePasswordResetTokenStatus(token)

  const tokenStatus = deriveTokenStatus(
    tokenStatusData,
    tokenStatusLoading,
    mutationTokenError
  )

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  })

  const password = resetForm.watch('password')
  const strengthOk = isPasswordStrongEnough(password ?? '')

  const canSubmitReset =
    !!token &&
    tokenStatus !== 'expired' &&
    tokenStatus !== 'invalid' &&
    tokenStatus !== 'checking' &&
    strengthOk &&
    resetForm.watch('confirm') === password

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        document.querySelector<HTMLInputElement>('#email')?.focus()
      } else {
        document.querySelector<HTMLInputElement>('#password')?.focus()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [token])

  const onRequest = (data: RequestForm) => {
    request.mutate(data.email, { onSuccess: () => setRequested(true) })
  }

  const onReset = (data: ResetForm) => {
    if (!token) return
    setMutationTokenError(null)
    reset.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          setSearchParams({})
          navigate('/login', { replace: true })
        },
        onError: (err: Error) => {
          const msg = (err?.message ?? '').toLowerCase()
          if (
            msg.includes('expired') ||
            msg.includes('invalid') ||
            msg.includes('token')
          ) {
            setMutationTokenError(msg.includes('expired') ? 'expired' : 'invalid')
          }
        },
      }
    )
  }

  const handleRequestNewReset = () => {
    setMutationTokenError(null)
    setSearchParams({})
    setRequested(false)
  }

  if (token) {
    return (
      <LayoutWrapper>
        <div className="w-full animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg" aria-label="Home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              Gbox360
            </Link>
          </div>

          <div className="flex justify-center lg:justify-start mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <KeyRound className="h-7 w-7 text-accent" aria-hidden />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Set new password
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your new password. Reset links expire after 1 hour for security.
            </p>
          </div>

          <div className="space-y-4">
            <TokenStatusBanner
              status={tokenStatus}
              reason={tokenStatusData?.reason}
              onRequestNewReset={handleRequestNewReset}
            />
            {tokenStatus === 'valid' && <TokenStatusValidBanner />}
            {tokenStatus !== 'expired' && tokenStatus !== 'invalid' && (
              <form
                onSubmit={resetForm.handleSubmit(onReset)}
                className="space-y-4"
                noValidate
                aria-label="Set new password"
                aria-busy={reset.isPending}
              >
                <Controller
                  control={resetForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <PasswordField
                      id="password"
                      label="New password"
                      placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                      showStrengthMeter
                      autoComplete="new-password"
                      disabled={reset.isPending}
                      aria-describedby="password-strength-hint"
                    />
                  )}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    disabled={reset.isPending}
                    aria-invalid={!!resetForm.formState.errors.confirm}
                    aria-label="Confirm new password"
                    aria-describedby={resetForm.formState.errors.confirm ? 'confirm-error' : undefined}
                    {...resetForm.register('confirm')}
                  />
                  {resetForm.formState.errors.confirm && (
                    <p id="confirm-error" className="text-sm text-destructive" role="alert">
                      {resetForm.formState.errors.confirm.message}
                    </p>
                  )}
                </div>
                <HelperTextBlock variant="security" />
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full font-semibold"
                  disabled={!canSubmitReset || reset.isPending}
                  aria-label={reset.isPending ? 'Updating password…' : 'Set new password'}
                  aria-busy={reset.isPending}
                >
                  {reset.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      Updating...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            )}
            <p className="text-center text-sm text-muted-foreground pt-4">
              <Link
                to="/login"
                className="text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label="Back to sign in"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="w-full animate-fade-in-up">
        {/* Mobile logo */}
        <div className="flex justify-center mb-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg" aria-label="Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            Gbox360
          </Link>
        </div>

        <div className="flex justify-center lg:justify-start mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <KeyRound className="h-7 w-7 text-accent" aria-hidden />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Reset password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {requested ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-success/5 border border-success/20 p-4">
              <p className="text-sm text-foreground" role="status" aria-live="polite">
                If this email is registered, you&apos;ll receive a password reset
                link shortly.
              </p>
            </div>
            <HelperTextBlock variant="token-expiry" />
            <HelperTextBlock variant="rate-limit" />
            <p className="text-sm text-muted-foreground">
              Having trouble? <PasswordResetSupportLink className="font-semibold text-accent" />
            </p>
            <p className="text-center text-sm text-muted-foreground pt-4">
              <Link
                to="/login"
                className="text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label="Back to sign in"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form
            onSubmit={requestForm.handleSubmit(onRequest)}
            className="space-y-4"
            noValidate
            aria-label="Request password reset link"
            aria-busy={request.isPending}
          >
            {request.isError && (
              <div
                role="alert"
                aria-live="assertive"
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive',
                  'animate-fade-in-up'
                )}
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
                <p className="flex-1">
                  {request.error?.message ?? 'Password reset request failed. Please try again.'}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                disabled={request.isPending}
                aria-invalid={!!requestForm.formState.errors.email}
                aria-describedby={requestForm.formState.errors.email ? 'email-error' : undefined}
                {...requestForm.register('email')}
              />
              {requestForm.formState.errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {requestForm.formState.errors.email.message}
                </p>
              )}
            </div>
            {!requestForm.watch('email')?.trim() && (
              <div
                role="status"
                aria-label="No email entered"
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground',
                  'transition-opacity duration-200'
                )}
              >
                <Mail className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
                <p>
                  Enter your email address above and click &quot;Send reset link&quot; to receive a
                  secure password reset link.
                </p>
              </div>
            )}
            <HelperTextBlock variant="rate-limit" />
            <Button
              type="submit"
              variant="accent"
              className="w-full font-semibold"
              disabled={request.isPending}
              aria-label={request.isPending ? 'Sending reset link…' : 'Send password reset link to your email'}
              aria-busy={request.isPending}
            >
              {request.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        )}
        {!requested && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label="Back to sign in"
            >
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </LayoutWrapper>
  )
}
