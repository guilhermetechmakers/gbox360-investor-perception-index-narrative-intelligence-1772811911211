/**
 * SignalBadge - compact chip for signal type (Credibility / Risk) and short descriptor
 */
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SignalRecord } from '@/types/signals'

const SIGNAL_LABELS: Record<string, string> = {
  management_language_consistency: 'Mgmt language',
  repetition_consistency: 'Repetition',
  negative_earnings_language: 'Neg. earnings',
  legal_governance_words: 'Legal/Gov',
}

interface SignalBadgeProps {
  signal: SignalRecord
  variant?: 'credibility' | 'risk'
  className?: string
  showWeight?: boolean
}

export function SignalBadge({
  signal,
  variant = 'credibility',
  className,
  showWeight = true,
}: SignalBadgeProps) {
  const label = SIGNAL_LABELS[signal.type] ?? signal.type.replace(/_/g, ' ')
  const desc = signal.description ?? ''
  const weight = typeof signal.weight === 'number' ? (signal.weight * 100).toFixed(0) : '—'

  const content = (
    <Badge
      variant={variant === 'risk' ? 'destructive' : 'success'}
      className={cn(
        'text-[10px] py-0 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)] focus-visible:ring-offset-2',
        className
      )}
      aria-label={`${label}: ${desc}`}
    >
      {label}
      {showWeight && (
        <span className="ml-1 opacity-90">{(weight as string)}%</span>
      )}
    </Badge>
  )

  if (!desc) return content

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          {showWeight && (
            <p className="text-xs mt-1">Weight: {weight}%</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
