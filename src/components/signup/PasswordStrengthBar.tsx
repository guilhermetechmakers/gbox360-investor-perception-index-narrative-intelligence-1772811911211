/**
 * Password strength meter with live validation rules and feedback.
 * Displays strength bar and checklist of password requirements.
 */
import { Progress } from '@/components/ui/progress'
import { getPasswordStrengthScore, type PasswordStrength } from '@/lib/auth-validation'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export interface PasswordStrengthBarProps {
  password: string
  className?: string
  showRules?: boolean
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
}

const STRENGTH_LABEL_COLORS: Record<PasswordStrength, string> = {
  weak: 'text-destructive',
  moderate: 'text-accent',
  strong: 'text-success',
}

interface RuleCheck {
  label: string
  met: boolean
}

function getRuleChecks(password: string): RuleCheck[] {
  const p = password ?? ''
  return [
    { label: 'At least 8 characters', met: p.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(p) },
    { label: 'One lowercase letter', met: /[a-z]/.test(p) },
    { label: 'One number', met: /[0-9]/.test(p) },
    { label: 'One symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(p) },
  ]
}

export function PasswordStrengthBar({
  password,
  className,
  showRules = true,
}: PasswordStrengthBarProps) {
  const score = getPasswordStrengthScore(password ?? '')
  const strength: PasswordStrength =
    score < 40 ? 'weak' : score < 70 ? 'moderate' : 'strong'
  const label = STRENGTH_LABELS[strength]
  const labelColorClass = STRENGTH_LABEL_COLORS[strength]
  const rules = getRuleChecks(password ?? '')

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1.5">
        <Progress value={score} className="h-1.5" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Password strength:{' '}
          <span className={cn('font-medium', labelColorClass)}>{label}</span>
        </p>
      </div>
      {showRules && (
        <ul className="space-y-1.5 text-xs text-muted-foreground" role="list">
          {(rules ?? []).map((r, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center gap-2 transition-colors',
                r.met ? 'text-success' : ''
              )}
            >
              {r.met ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              )}
              <span>{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
