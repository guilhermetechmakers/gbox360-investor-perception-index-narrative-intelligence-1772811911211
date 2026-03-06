import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReplayStatus } from '@/types/narrative-event-canonical'

interface ReplayControlPanelProps {
  status: ReplayStatus
  onTriggerReplay: () => void
  isReplaying?: boolean
  errorMessage?: string
  completedAt?: string
}

const STATUS_CONFIG: Record<ReplayStatus, { label: string; icon: typeof Play; className: string }> = {
  idle: { label: 'Idle', icon: Clock, className: 'text-muted-foreground' },
  running: { label: 'Running', icon: Loader2, className: 'text-accent' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-success' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-destructive' },
}

export function ReplayControlPanel({
  status,
  onTriggerReplay,
  isReplaying = false,
  errorMessage,
  completedAt,
}: ReplayControlPanelProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle
  const Icon = config.icon

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Replay / Rebuild</CardTitle>
        <p className="text-sm text-muted-foreground">
          Trigger read-index snapshot rebuild from narrative events
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'h-5 w-5',
              config.className,
              status === 'running' && 'animate-spin'
            )}
          />
          <span className={cn('text-sm font-medium', config.className)}>
            {config.label}
          </span>
        </div>
        {completedAt && status === 'completed' && (
          <p className="text-xs text-muted-foreground">
            Completed at {new Date(completedAt).toLocaleString()}
          </p>
        )}
        {errorMessage && status === 'failed' && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
        <Button
          onClick={onTriggerReplay}
          disabled={isReplaying || status === 'running'}
          className="gap-2"
          aria-label="Trigger replay"
        >
          {isReplaying || status === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Trigger replay
        </Button>
      </CardContent>
    </Card>
  )
}
