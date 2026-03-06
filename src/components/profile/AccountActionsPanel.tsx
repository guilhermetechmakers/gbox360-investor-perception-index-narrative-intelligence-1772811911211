import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings,
  LogOut,
  FileDown,
  Trash2,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { useSignOut } from '@/hooks/useAuth'
import { useDataExport } from '@/hooks/useSettings'
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal'
import { ProvisionalWeightPreview } from './ProvisionalWeightPreview'
import { cn } from '@/lib/utils'

export function AccountActionsPanel() {
  const navigate = useNavigate()
  const signOut = useSignOut()
  const exportData = useDataExport()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [weightPreviewOpen, setWeightPreviewOpen] = useState(false)

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    })
  }

  const handleExport = () => {
    exportData.mutate('csv')
  }

  return (
    <>
      <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-base">Account actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Settings, sign out, export, and account management
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.01]"
            asChild
          >
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.01]"
            onClick={() => setWeightPreviewOpen(true)}
          >
            <BarChart3 className="h-4 w-4" />
            Provisional weight preview
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.01]"
            onClick={handleExport}
            disabled={exportData.isPending}
          >
            {exportData.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Export data
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 transition-all duration-200 hover:scale-[1.01]"
            onClick={handleSignOut}
            disabled={signOut.isPending}
          >
            {signOut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign out
          </Button>

          <Button
            variant="destructive"
            className={cn(
              'w-full justify-start gap-2 mt-4 transition-all duration-200',
              'hover:scale-[1.01] focus-visible:ring-destructive'
            )}
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </CardContent>
      </Card>

      <ProvisionalWeightPreview open={weightPreviewOpen} onOpenChange={setWeightPreviewOpen} />
      <DeleteAccountModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </>
  )
}
