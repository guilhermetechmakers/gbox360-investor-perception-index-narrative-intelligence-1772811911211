import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Inbox, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DLQEntry } from '@/types/ingest'

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

interface DLQManagerProps {
  entries: DLQEntry[]
  onRetry: (id: string, idempotencyKey: string) => Promise<unknown>
  onPurge: (id: string, idempotencyKey: string) => Promise<unknown>
  isLoading?: boolean
}

export function DLQManager({
  entries = [],
  onRetry,
  onPurge,
  isLoading = false,
}: DLQManagerProps) {
  const [actionEntry, setActionEntry] = useState<{ id: string; action: 'retry' | 'purge' } | null>(null)
  const [processing, setProcessing] = useState(false)
  const items = Array.isArray(entries) ? entries : []

  const handleAction = async () => {
    if (!actionEntry || processing) return
    setProcessing(true)
    try {
      const key = `dlq-${actionEntry.action}-${actionEntry.id}-${Date.now()}`
      if (actionEntry.action === 'retry') {
        await onRetry(actionEntry.id, key)
      } else {
        await onPurge(actionEntry.id, key)
      }
      setActionEntry(null)
    } finally {
      setProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            Dead letter queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            Dead letter queue
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Retry or purge failed payloads
          </p>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No DLQ entries.</p>
          ) : (
            <ScrollArea className="h-[240px] pr-4">
              <div className="space-y-2">
                {items.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-start justify-between gap-4 rounded-lg border border-border p-3',
                      'transition-all duration-200 hover:shadow-card'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.createdAt ?? '')} · {entry.sourceId ?? '—'}
                      </p>
                      <p className="text-sm font-medium mt-0.5 line-clamp-2">{entry.reason ?? 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Retries: {entry.retryCount ?? 0}
                        </Badge>
                        <Badge variant={entry.status === 'executed' ? 'success' : 'accent'}>
                          {entry.status ?? 'pending'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionEntry({ id: entry.id, action: 'retry' })}
                        disabled={entry.status === 'executed'}
                        aria-label={`Retry DLQ entry ${entry.id}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionEntry({ id: entry.id, action: 'purge' })}
                        aria-label={`Purge DLQ entry ${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!actionEntry}
        onOpenChange={(o) => !o && setActionEntry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionEntry?.action === 'retry' ? 'Retry DLQ entry?' : 'Purge DLQ entry?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionEntry?.action === 'retry'
                ? 'This will requeue the payload for processing. The operation is idempotent.'
                : 'This will permanently remove the entry from the DLQ. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleAction()
              }}
              disabled={processing}
              className={actionEntry?.action === 'purge' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
            >
              {processing ? 'Processing…' : actionEntry?.action === 'retry' ? 'Retry' : 'Purge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
