import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export interface ReplayParams {
  idempotencyKey: string
  reason?: string
}

interface ReplayControlProps {
  onReplayPayload?: (id: string, params?: ReplayParams) => void
  onReplaySelected?: (ids: string[], params?: ReplayParams) => void
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
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [reason, setReason] = useState('')

  const ids = Array.isArray(selectedPayloadIds) ? selectedPayloadIds : []
  const hasSelection = ids.length > 0
  const canReplaySingle = !!selectedPayloadId && typeof selectedPayloadId === 'string'
  const canReplayBatch = hasSelection && ids.every((x) => typeof x === 'string')

  const defaultIdempotencyKey = `replay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const effectiveKey = idempotencyKey.trim() || defaultIdempotencyKey

  const handleSingleReplay = () => {
    if (canReplaySingle) {
      onReplayPayload?.(selectedPayloadId!, {
        idempotencyKey: effectiveKey,
        reason: reason.trim() || undefined,
      })
      setShowSingleConfirm(false)
      setIdempotencyKey('')
      setReason('')
    }
  }

  const handleBatchReplay = () => {
    if (canReplayBatch) {
      onReplaySelected?.(ids, {
        idempotencyKey: effectiveKey,
        reason: reason.trim() || undefined,
      })
      setShowBatchConfirm(false)
      setIdempotencyKey('')
      setReason('')
    }
  }

  const ReplayFormFields = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="idempotency-key">Idempotency key</Label>
        <Input
          id="idempotency-key"
          placeholder={defaultIdempotencyKey}
          value={idempotencyKey}
          onChange={(e) => setIdempotencyKey(e.target.value)}
          className="font-mono text-sm"
          aria-describedby="idempotency-key-desc"
        />
        <p id="idempotency-key-desc" className="text-xs text-muted-foreground">
          Unique key to prevent duplicate replays. Leave empty to auto-generate.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="replay-reason">Reason (optional)</Label>
        <Input
          id="replay-reason"
          placeholder="e.g. Retry after schema fix"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-describedby="replay-reason-desc"
        />
        <p id="replay-reason-desc" className="text-xs text-muted-foreground">
          Justification for audit log.
        </p>
      </div>
    </div>
  )

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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Replay ingestion</AlertDialogTitle>
            <AlertDialogDescription>
              This will replay the selected payload through the normalization pipeline.
              Idempotency is enforced via the key below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ReplayFormFields />
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Replay batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will replay {ids.length} payload(s) through the normalization pipeline.
              Idempotency is enforced via the key below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ReplayFormFields />
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
