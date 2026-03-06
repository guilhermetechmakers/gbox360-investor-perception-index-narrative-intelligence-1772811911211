import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteAccount } from '@/hooks/useSettings'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONFIRM_TEXT = 'DELETE'

export interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const [confirmInput, setConfirmInput] = useState('')
  const deleteAccount = useDeleteAccount()

  const isConfirmed = confirmInput.trim().toUpperCase() === CONFIRM_TEXT
  const isBusy = deleteAccount.isPending

  const handleConfirm = () => {
    if (!isConfirmed || isBusy) return
    deleteAccount.mutate(undefined, {
      onSuccess: (ok) => {
        if (ok) onOpenChange(false)
      },
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmInput('')
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10"
              aria-hidden
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All your data will be permanently removed.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            You will lose access to your profile, saved companies, and all associated data. Please
            export your data first if you need a copy.
          </p>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <strong>{CONFIRM_TEXT}</strong> to confirm
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={CONFIRM_TEXT}
              className={cn(
                'font-mono',
                confirmInput && !isConfirmed && 'border-destructive focus-visible:ring-destructive'
              )}
              autoComplete="off"
              aria-invalid={!!confirmInput && !isConfirmed}
              disabled={isBusy}
            />
            {confirmInput && !isConfirmed && (
              <p className="text-sm text-destructive" role="alert">
                You must type {CONFIRM_TEXT} exactly to confirm.
              </p>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isBusy}
          >
            {isBusy ? 'Deleting…' : 'Delete my account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
