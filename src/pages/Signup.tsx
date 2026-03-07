import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordStrengthBar } from '@/components/signup/PasswordStrengthBar'
import { TermsAndPrivacyConsent } from '@/components/signup/TermsAndPrivacyConsent'
import { OAuthSignupButtons } from '@/components/signup/OAuthSignupButtons'
import { LayoutWrapper } from '@/components/login/LayoutWrapper'
import { useSignUp } from '@/hooks/useAuth'
import { isSignupPasswordValid, isInviteCodeFormatValid } from '@/lib/auth-validation'
import { Building2 } from 'lucide-react'

const ROLE_OPTIONS = ['Investor', 'Executive', 'Research'] as const

const schema = z
  .object({
    name: z.string().min(1, 'Full name is required').max(120, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters required')
      .refine(isSignupPasswordValid, {
        message:
          'Password must include uppercase, lowercase, number, and symbol (!@#$%^&*)',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    organization: z.string().max(120).optional().or(z.literal('')),
    role: z.enum(ROLE_OPTIONS),
    inviteCode: z
      .string()
      .optional()
      .refine((v) => !v || v.trim() === '' || isInviteCodeFormatValid(v ?? ''), {
        message: 'Invite code must be 6–24 alphanumeric characters',
      }),
    terms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms and Privacy Policy',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function Signup() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      role: 'Investor',
      organization: '',
      inviteCode: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const password = watch('password') ?? ''
  const termsChecked = watch('terms') === true

  const onSubmit = (data: FormData) => {
    signUp.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        org: data.organization?.trim() || undefined,
        role: data.role,
        invite_code: data.inviteCode?.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          const res = response ?? {}
          const requiresVerify =
            (res as { requiresEmailVerification?: boolean }).requiresEmailVerification === true
          const hasToken = !!(res as { token?: string }).token

          if (requiresVerify || !hasToken) {
            navigate('/verify-email', { state: { email: data.email } })
          } else {
            navigate('/dashboard')
          }
        },
      }
    )
  }

  const isFormValid = isValid && termsChecked
  const isSubmitting = signUp.isPending

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

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get started with Gbox360 — narrative intelligence at your fingertips.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <fieldset className="space-y-4" disabled={isSubmitting}>
            {/* Name and Email row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  className="mt-1.5"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-required
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="mt-1.5"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-required
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 chars, upper, lower, number, symbol"
                className="mt-1.5"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-required
                {...register('password')}
              />
              <PasswordStrengthBar
                password={password ?? ''}
                className="mt-2"
                showRules
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="mt-1.5"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-required
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Organization and Role row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="organization" className="text-sm font-medium">Organization</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Acme Inc"
                  className="mt-1.5"
                  autoComplete="organization"
                  {...register('organization')}
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="role" className="mt-1.5">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(ROLE_OPTIONS ?? []).map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Invite code */}
            <div>
              <Label htmlFor="inviteCode" className="text-sm font-medium">Invite code <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Enterprise trial code"
                className="mt-1.5"
                aria-invalid={!!errors.inviteCode}
                {...register('inviteCode')}
              />
              {errors.inviteCode && (
                <p className="text-sm text-destructive mt-1" role="alert">
                  {errors.inviteCode.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <Controller
              name="terms"
              control={control}
              render={({ field, fieldState }) => (
                <TermsAndPrivacyConsent
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  error={fieldState.error?.message}
                  disabled={isSubmitting}
                  id="terms"
                />
              )}
            />

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
              disabled={!isFormValid || isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </fieldset>

          <OAuthSignupButtons disabled={isSubmitting} />
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </LayoutWrapper>
  )
}
