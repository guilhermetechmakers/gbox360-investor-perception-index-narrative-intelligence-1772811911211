import { Link } from 'react-router-dom'
import { Wifi, Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIPS = [
  { id: 'network', label: 'Check your network connection', icon: Wifi },
  { id: 'retry', label: 'Try again in a few moments', icon: Clock },
] as const

interface RemediationTipsProps {
  /** Optional className */
  className?: string
}

/**
 * Small tips strip with remediation suggestions and Contact Support action.
 */
export function RemediationTips({ className }: RemediationTipsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-border',
        className
      )}
    >
      {TIPS.map(({ id, label, icon: Icon }) => (
        <span
          key={id}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </span>
      ))}
      <Link
        to="/about"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Mail className="h-3.5 w-3.5" aria-hidden />
        Contact Support
      </Link>
    </div>
  )
}
