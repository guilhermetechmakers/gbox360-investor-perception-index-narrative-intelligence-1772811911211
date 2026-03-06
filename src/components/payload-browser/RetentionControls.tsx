import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { Trash2 } from 'lucide-react'

interface RetentionControlsProps {
  payloadsSelected: { id: string; retentionFlag?: boolean }[]
  onMarkRetention: (id: string, retain: boolean) => void
  onPurge: (id: string) => void
  isAdmin?: boolean
}

export function RetentionControls({
  payloadsSelected = [],
  onMarkRetention,
  onPurge,
  isAdmin = true,
}: RetentionControlsProps) {
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false)
  const [purgeTargetId, setPurgeTargetId] = useState<string | null>(null)

  const items = Array.isArray(payloadsSelected) ? payloadsSelected : []
  const singlePayload = items.length === 1 ? items[0] : null

  const handlePurgeClick = () => {
    if (singlePayload) {
      setPurgeTargetId(singlePayload.id)
      setShowPurgeConfirm(true)
    }
  }

  const handlePurgeConfirm = () => {
    if (purgeTargetId) {
      onPurge(purgeTargetId)
      setPurgeTargetId(null)
      setShowPurgeConfirm(false)
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <Card className="card-surface transition-all duration-200 border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-destructive">
            Retention & purge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {singlePayload && (
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="retention-toggle" className="text-sm">
                Mark for retention
              </Label>
              <Switch
                id="retention-toggle"
                checked={singlePayload.retentionFlag ?? false}
                onCheckedChange={(checked) =>
                  onMarkRetention(singlePayload.id, !!checked)
                }
              />
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            disabled={items.length !== 1}
            onClick={handlePurgeClick}
          >
            <Trash2 className="h-4 w-4" />
            Purge selected ({items.length})
          </Button>

          <p className="text-xs text-muted-foreground">
            Purge is irreversible. Use only for admin-controlled retention.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showPurgeConfirm} onOpenChange={setShowPurgeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purge payload</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected payload. This action cannot be undone.
              Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPurgeTargetId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePurgeConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
