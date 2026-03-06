import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VerificationStatusType } from '@/types/auth'

const statusConfig: Record<
  VerificationStatusType,
  { label: string; variant: 'default' | 'secondary' | 'accent' | 'success' | 'destructive' | 'outline' }
> = {
  sent: { label: 'Sent', variant: 'accent' },
  delivered: { label: 'Delivered', variant: 'success' },
  bounced: { label: 'Bounced', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'secondary' },
  idle: { label: 'Idle', variant: 'outline' },
  unknown: { label: 'Unknown', variant: 'outline' },
}

export interface StatusBadgeProps {
  status: VerificationStatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.unknown
  return (
    <Badge
      variant={config.variant}
      className={cn('transition-colors duration-200', className)}
      aria-label={`Verification status: ${config.label}`}
    >
      {config.label}
    </Badge>
  )
}
