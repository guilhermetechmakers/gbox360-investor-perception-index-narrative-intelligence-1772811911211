import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown, ChevronRight, ScrollText } from 'lucide-react'
import { adminDashboardApi } from '@/api/admin-dashboard'
import { toast } from 'sonner'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ActivityAuditExportPanel() {
  const [exportLoading, setExportLoading] = useState(false)

  const handleExportAuditLogs = async () => {
    setExportLoading(true)
    try {
      const blob = await adminDashboardApi.exportAuditLogs({ format: 'json' })
      downloadBlob(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Audit logs exported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileDown className="h-5 w-5 text-muted-foreground" />
          Audit export
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Initiate signed audit artifact export and view admin action logs
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild className="w-full sm:w-auto" variant="default">
            <Link to="/admin/audit-exports" className="flex items-center gap-2">
              Initiate export
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportAuditLogs}
            disabled={exportLoading}
          >
            <ScrollText className="h-4 w-4" />
            {exportLoading ? 'Exporting…' : 'Export audit logs'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Select scope (company, time window), choose events, and generate signed JSON + PDF artifacts.
          Audit logs record all admin actions with operator id, timestamp, and justification.
        </p>
      </CardContent>
    </Card>
  )
}
