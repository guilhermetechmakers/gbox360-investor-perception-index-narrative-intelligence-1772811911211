import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StrengthMeter } from './StrengthMeter'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordFieldProps {
  id: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  showStrengthMeter?: boolean
  autoComplete?: string
  disabled?: boolean
  'aria-describedby'?: string
  className?: string
}

export function PasswordField({
  id,
  label,
  placeholder = 'Enter password',
  value = '',
  onChange,
  onBlur,
  error,
  showStrengthMeter = false,
  autoComplete = 'new-password',
  disabled = false,
  'aria-describedby': ariaDescribedby,
  className,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            [ariaDescribedby, error ? `${id}-error` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className="pr-10"
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
      {showStrengthMeter && <StrengthMeter password={value} />}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
