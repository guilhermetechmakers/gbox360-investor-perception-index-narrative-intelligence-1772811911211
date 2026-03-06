/**
 * Password input with show/hide toggle.
 * Used in LoginFormComponent.
 */
import { forwardRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputWithToggleProps
  extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  id: string
  label: string
  error?: string
  'aria-describedby'?: string
}

export const PasswordInputWithToggle = forwardRef<
  HTMLInputElement,
  PasswordInputWithToggleProps
>(function PasswordInputWithToggle(
  { id, label, error, className, 'aria-describedby': ariaDescribedby, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={
            [ariaDescribedby, error ? `${id}-error` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn('pr-10', className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((p) => !p)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
        </Button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
