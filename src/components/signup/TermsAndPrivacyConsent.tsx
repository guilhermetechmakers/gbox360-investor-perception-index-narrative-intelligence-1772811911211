/**
 * Terms & Privacy consent checkbox with inline links.
 * Required for signup; uses Shadcn Checkbox for accessibility.
 */
import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface TermsAndPrivacyConsentProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function TermsAndPrivacyConsent({
  checked,
  onCheckedChange,
  error,
  disabled = false,
  id = 'terms',
  className,
}: TermsAndPrivacyConsentProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 shrink-0"
        />
        <label
          htmlFor={id}
          className="text-sm leading-relaxed cursor-pointer select-none"
        >
          I agree to the{' '}
          <Link
            to="/terms"
            className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
