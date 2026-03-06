import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Play } from 'lucide-react'

interface ReplayControlProps {
  onReplayPayload?: (id: string) => void
  onReplaySelected?: (ids: string[]) => void
  selectedPayloadId?: string | null
  selectedPayloadIds?: string[]
  isReplaying?: boolean
}

export function ReplayControl({
  onReplayPayload,
  onReplaySelected,
  selectedPayloadId,
  selectedPayloadIds = [],
  isReplaying = false,
}: ReplayControlProps) {
  const [showSingleConfirm, setShowSingleConfirm] = useState(false)
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)

  const ids = Array.isArray(selectedPayloadIds) ? selectedPayloadIds : []
  const hasSelection = ids.length > 0
  const canReplaySingle = !!selectedPayloadId && typeof selectedPayloadId === 'string'
  const canReplayBatch = hasSelection && ids.every((x) => typeof x === 'string')

  const handleSingleReplay = () => {
    if (canReplaySingle) {
      onReplayPayload?.(selectedPayloadId!)
      setShowSingleConfirm(false)
    }
  }

  const handleBatchReplay = () => {
    if (canReplayBatch) {
      onReplaySelected?.(ids)
      setShowBatchConfirm(false)
    }
  }

  return (
    <>
      <Card className="card-surface transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Replay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start gap-2"
            disabled={!canReplaySingle || isReplaying}
            onClick={() => setShowSingleConfirm(true)}
          >
            <Play className="h-4 w-4" />
            Replay selected payload
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start gap-2"
            disabled={!canReplayBatch || isReplaying}
            onClick={() => setShowBatchConfirm(true)}
          >
            <Play className="h-4 w-4" />
            Replay {ids.length} selected
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            Idempotent replay via external_id + content_hash. Confirmation required.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showSingleConfirm} onOpenChange={setShowSingleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replay ingestion</AlertDialogTitle>
            <AlertDialogDescription>
              This will replay the selected payload through the normalization pipeline.
              Idempotency is enforced via external_id + content_hash. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSingleReplay}
              disabled={isReplaying}
            >
              {isReplaying ? 'Replaying…' : 'Replay'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBatchConfirm} onOpenChange={setShowBatchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replay batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will replay {ids.length} payload(s) through the normalization pipeline.
              Idempotency is enforced. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchReplay}
              disabled={isReplaying}
            >
              {isReplaying ? 'Replaying…' : 'Replay batch'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
