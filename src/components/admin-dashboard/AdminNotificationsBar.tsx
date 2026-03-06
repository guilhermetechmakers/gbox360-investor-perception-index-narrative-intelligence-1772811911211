import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminNotification } from '@/api/admin-dashboard'

interface AdminNotificationsBarProps {
  notifications?: AdminNotification[]
  onDismiss?: (id: string) => void
  onAcknowledge?: (id: string) => void
}

const SEVERITY_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const SEVERITY_STYLES = {
  critical: 'border-destructive/50 bg-destructive/5',
  warning: 'border-accent/50 bg-accent/5',
  info: 'border-primary/20 bg-muted/50',
}

export function AdminNotificationsBar({
  notifications = [],
  onDismiss,
  onAcknowledge,
}: AdminNotificationsBarProps) {
  const items = Array.isArray(notifications) ? notifications : []
  const unacknowledged = items.filter((n) => !n.acknowledged)

  if (unacknowledged.length === 0) return null

  return (
    <div className="space-y-2">
      {unacknowledged.slice(0, 5).map((n) => {
        const Icon = SEVERITY_ICONS[n.severity] ?? Info
        const style = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info
        return (
          <Card
            key={n.id}
            className={cn(
              'border transition-all duration-200',
              style
            )}
          >
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 mt-0.5',
                    n.severity === 'critical' && 'text-destructive',
                    n.severity === 'warning' && 'text-accent',
                    n.severity === 'info' && 'text-muted-foreground'
                  )}
                />
                <div className="min-w-0">
                  <p className="font-medium">
                    {n.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                  {n.actionUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-accent"
                      asChild
                    >
                      <a href={n.actionUrl}>View details</a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.acknowledged && onAcknowledge && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAcknowledge(n.id)}
                    className="text-xs"
                  >
                    Acknowledge
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDismiss(n.id)}
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
