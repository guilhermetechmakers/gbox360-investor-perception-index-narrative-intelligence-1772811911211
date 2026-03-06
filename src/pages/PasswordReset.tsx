import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Building2, KeyRound } from 'lucide-react'

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold"
              aria-label="Home"
            >
              <Building2 className="h-8 w-8 text-primary" />
              Gbox360
            </Link>
          </div>
          <Card className="card-surface">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <CardTitle>Set new password</CardTitle>
              <CardDescription>
                Enter your new password. Reset links expire after 1 hour for security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      disabled={reset.isPending}
                      aria-invalid={!!resetForm.formState.errors.confirm}
                      aria-describedby={
                        resetForm.formState.errors.confirm
                          ? 'confirm-error'
                          : undefined
                      }
                      {...resetForm.register('confirm')}
                    />
                    {resetForm.formState.errors.confirm && (
                      <p
                        id="confirm-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {resetForm.formState.errors.confirm.message}
                      </p>
                    )}
                  </div>
                  <HelperTextBlock variant="security" />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmitReset || reset.isPending}
                  >
                    {reset.isPending ? 'Updating...' : 'Reset password'}
                  </Button>
                </form>
              )}
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
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold"
            aria-label="Home"
          >
            <Building2 className="h-8 w-8 text-primary" />
            Gbox360
          </Link>
        </div>
        <Card className="card-surface">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter your email and we will send a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requested ? (
              <div className="space-y-4">
                <p
                  className="text-center text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  If this email is registered, you&apos;ll receive a password reset
                  link shortly.
                </p>
                <HelperTextBlock variant="token-expiry" />
                <HelperTextBlock variant="rate-limit" />
                <p className="text-sm text-muted-foreground">
                  Having trouble? <PasswordResetSupportLink className="font-medium" />
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
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
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="off"
                    disabled={request.isPending}
                    aria-invalid={!!requestForm.formState.errors.email}
                    aria-describedby={
                      requestForm.formState.errors.email
                        ? 'email-error'
                        : undefined
                    }
                    {...requestForm.register('email')}
                  />
                  {requestForm.formState.errors.email && (
                    <p
                      id="email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <HelperTextBlock variant="rate-limit" />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={request.isPending}
                >
                  {request.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
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
  )
}
