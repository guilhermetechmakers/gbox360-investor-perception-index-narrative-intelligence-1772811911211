import { Progress } from '@/components/ui/progress'
import { getPasswordStrengthScore, type PasswordStrength } from '@/lib/auth-validation'
import { cn } from '@/lib/utils'

export interface StrengthMeterProps {
  password: string
  className?: string
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
}

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-destructive',
  moderate: 'bg-accent',
  strong: 'bg-success',
}

export function StrengthMeter({ password, className }: StrengthMeterProps) {
  const score = getPasswordStrengthScore(password ?? '')
  const strength: PasswordStrength =
    score < 40 ? 'weak' : score < 70 ? 'moderate' : 'strong'
  const label = STRENGTH_LABELS[strength]
  const colorClass = STRENGTH_COLORS[strength]

  return (
    <div className={cn('space-y-1.5', className)}>
      <Progress value={score} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        Password strength: <span className={cn('font-medium', colorClass)}>{label}</span>
      </p>
    </div>
  )
}
