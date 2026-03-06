import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Play, Loader2 } from 'lucide-react'

interface ReplayControlProps {
  sources: { id: string; name: string }[]
  onReplay: (params: { sourceId?: string; batchId?: string; idempotencyKey: string }) => Promise<unknown>
  isLoading?: boolean
}

export function ReplayControl({
  sources = [],
  onReplay,
  isLoading = false,
}: ReplayControlProps) {
  const [sourceId, setSourceId] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [replaying, setReplaying] = useState(false)

  const handleConfirm = async () => {
    if (replaying) return
    setReplaying(true)
    try {
      await onReplay({
        sourceId: sourceId === 'all' ? undefined : sourceId,
        idempotencyKey: `replay-${sourceId}-${Date.now()}`,
      })
      setOpen(false)
    } finally {
      setReplaying(false)
    }
  }

  const items = Array.isArray(sources) ? sources : []

  return (
    <>
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Replay control</CardTitle>
          <p className="text-sm text-muted-foreground">
            Trigger ingestion replay for a source or globally
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="replay-source">Source</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger id="replay-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {items.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setOpen(true)}
            disabled={isLoading}
            aria-label="Trigger replay"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Trigger replay
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm replay</AlertDialogTitle>
            <AlertDialogDescription>
              This will trigger an idempotent ingestion replay for{' '}
              {sourceId === 'all' ? 'all sources' : items.find((s) => s.id === sourceId)?.name ?? sourceId}.
              Duplicate payloads will be deduplicated. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={replaying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={replaying}
            >
              {replaying ? 'Replaying…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
