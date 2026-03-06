import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileJson } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface AuditExportPanelProps {
  onExport: () => void
  isLoading?: boolean
  lastExportAt?: string | null
  className?: string
}

export function AuditExportPanel({
  onExport,
  isLoading = false,
  lastExportAt,
  className,
}: AuditExportPanelProps) {
  return (
    <Card className={cn('card-surface', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          Audit export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Export user action logs as CSV or JSON for compliance and audit purposes.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          {isLoading ? 'Exporting…' : 'Export audit logs'}
        </Button>
        {lastExportAt && (
          <p className="text-xs text-muted-foreground">
            Last export: {format(new Date(lastExportAt), 'PPpp')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
