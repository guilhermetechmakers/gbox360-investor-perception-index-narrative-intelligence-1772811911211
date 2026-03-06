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

interface ManualTriggerCardProps {
  onTriggerBatch: () => Promise<unknown>
  isLoading?: boolean
}

export function ManualTriggerCard({
  onTriggerBatch,
  isLoading = false,
}: ManualTriggerCardProps) {
  const [open, setOpen] = useState(false)
  const [triggering, setTriggering] = useState(false)

  const handleConfirm = async () => {
    if (triggering) return
    setTriggering(true)
    try {
      await onTriggerBatch()
      setOpen(false)
    } finally {
      setTriggering(false)
    }
  }

  return (
    <>
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Manual trigger</CardTitle>
          <p className="text-sm text-muted-foreground">
            Trigger batch transcript import with idempotency safeguards
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setOpen(true)}
            disabled={isLoading}
            aria-label="Trigger batch transcript import"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Triggering…' : 'Trigger transcript import'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trigger batch import?</AlertDialogTitle>
            <AlertDialogDescription>
              This will trigger a batch transcript import. The operation is idempotent—duplicate
              payloads will be deduplicated by external_id and content_hash. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={triggering}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={triggering}
            >
              {triggering ? 'Triggering…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
