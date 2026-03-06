/**
 * Login form with email, password, remember-me, validation, and actions.
 */
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInputWithToggle } from './PasswordInputWithToggle'
import { GlobalErrorBanner } from './GlobalErrorBanner'
import { PasswordResetLink } from './PasswordResetLink'
import { OAuthButtons } from './OAuthButtons'
import { DemoModePanel } from './DemoModePanel'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof schema>

export interface LoginFormComponentProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>
  onDemo?: () => void
  loading?: boolean
  demoLoading?: boolean
  error?: string | null
  showOAuth?: boolean
  showDemoPanel?: boolean
  className?: string
}

export function LoginFormComponent({
  onSubmit,
  onDemo,
  loading = false,
  demoLoading = false,
  error,
  showOAuth = true,
  showDemoPanel = true,
  className,
}: LoginFormComponentProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { rememberMe: false },
  })

  const isSubmitting = loading
  const canSubmit = isValid && !isSubmitting

  return (
    <div className={cn('space-y-6', className)}>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="space-y-4"
        noValidate
      >
        <GlobalErrorBanner message={error} className="mb-4" />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="mt-1.5"
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

        <PasswordInputWithToggle
          id="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between gap-4">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <label
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
                htmlFor="rememberMe"
              >
                <Checkbox
                  id="rememberMe"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label="Remember me"
                />
                <span className="text-foreground">Remember me</span>
              </label>
            )}
          />
          <PasswordResetLink />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        {showOAuth && <OAuthButtons disabled={isSubmitting} className="pt-2" />}
      </form>

      {showDemoPanel && onDemo && (
        <DemoModePanel
          onStartDemo={onDemo}
          disabled={isSubmitting}
          isLoading={demoLoading}
        />
      )}
    </div>
  )
}
