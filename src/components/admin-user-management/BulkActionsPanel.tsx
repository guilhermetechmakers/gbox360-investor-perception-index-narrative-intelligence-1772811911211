import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkActionsPanelProps {
  selectedCount: number
  onImportCsv: (file: File) => void
  onExportCsv: () => void
  onBulkRoleAssign?: () => void
  importLoading?: boolean
  exportLoading?: boolean
  importProgress?: number
  className?: string
}

export function BulkActionsPanel({
  selectedCount,
  onImportCsv,
  onExportCsv,
  onBulkRoleAssign,
  importLoading = false,
  exportLoading = false,
  importProgress,
  className,
}: BulkActionsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImportCsv(file)
      e.target.value = ''
    }
  }

  return (
    <Card className={cn('card-surface', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Bulk actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {importLoading ? 'Importing…' : 'Import CSV'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            disabled={exportLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportLoading ? 'Exporting…' : 'Export CSV'}
          </Button>
          {onBulkRoleAssign && selectedCount > 0 && (
            <Button variant="outline" size="sm" onClick={onBulkRoleAssign}>
              <Users className="mr-2 h-4 w-4" />
              Assign roles ({selectedCount})
            </Button>
          )}
        </div>
        {importProgress !== undefined && importProgress < 100 && (
          <div className="space-y-1">
            <Progress value={importProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">Import in progress…</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
