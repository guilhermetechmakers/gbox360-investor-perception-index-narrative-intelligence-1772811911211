/**
 * Batch status view for transcript ingestion
 * Shows processing progress and per-batch DLQ errors
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react'
import type { TranscriptBatchStatus, BatchStatus } from '@/types/ingest'

function statusIcon(status: BatchStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-destructive" />
    case 'in_progress':
      return <Loader2 className="h-5 w-5 text-accent animate-spin" />
    case 'partial':
      return <AlertTriangle className="h-5 w-5 text-accent" />
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />
  }
}

function statusBadgeVariant(status: BatchStatus): 'default' | 'secondary' | 'destructive' | 'success' | 'accent' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'in_progress':
      return 'accent'
    case 'partial':
      return 'accent'
    default:
      return 'secondary'
  }
}

function formatTime(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

interface BatchStatusViewProps {
  status: TranscriptBatchStatus | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function BatchStatusView({ status, isLoading = false }: BatchStatusViewProps) {
  const data = status ?? null
  const total = data?.total_items ?? 0
  const processed = data?.processed ?? 0
  const failed = data?.failed ?? 0
  const skipped = data?.skipped ?? 0
  const batchStatus = (data?.status ?? 'pending') as BatchStatus
  const errors = data?.errors ?? []
  const progressPct = total > 0 ? Math.min(100, ((processed + failed + skipped) / total) * 100) : 0

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-24 w-full mt-4 rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Batch status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submit a batch to view status
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No batch selected
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {statusIcon(batchStatus)}
            Batch: {data.batch_id}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Started {formatTime(data.started_at)} · Completed {formatTime(data.completed_at)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(batchStatus)}>
          {batchStatus.replace('_', ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{total}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Processed</p>
            <p className="text-lg font-semibold text-success">{processed}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-lg font-semibold text-destructive">{failed}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Skipped</p>
            <p className="text-lg font-semibold text-muted-foreground">{skipped}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {Array.isArray(errors) && errors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Errors ({errors.length})</p>
            <ScrollArea className="h-[160px] rounded-lg border border-border p-3">
              <div className="space-y-2">
                {errors.map((err, i) => (
                  <div
                    key={`${err.item_id}-${i}`}
                    className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{err.item_id ?? 'Unknown'}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{err.message ?? '—'}</p>
                    {err.error_code && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {err.error_code}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
