import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataExportPanel } from './DataExportPanel'
import { DeleteAccountModal } from './DeleteAccountModal'
import { Trash2, ShieldAlert } from 'lucide-react'

export function AccountControlsPanel() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <DataExportPanel />

      <Card className="card-surface border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Account controls
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Before deleting, consider exporting your data. Once deleted, your account and all
            saved companies, preferences, and audit history will be removed.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </div>
  )
}
