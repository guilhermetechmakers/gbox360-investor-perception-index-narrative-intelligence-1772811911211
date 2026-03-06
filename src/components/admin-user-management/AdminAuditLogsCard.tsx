/**
 * Admin action audit logs - displays recent AdminActionAudit entries with filters and export
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollText, FileDown } from 'lucide-react'
import { useAuditLogs } from '@/hooks/useAdminDashboard'
import { adminDashboardApi } from '@/api/admin-dashboard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminAuditLogsCard() {
  const [exportLoading, setExportLoading] = useState(false)
  const { data, isLoading } = useAuditLogs({ limit: 10 })

  const logs = Array.isArray(data?.data) ? data.data : []

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const blob = await adminDashboardApi.exportAuditLogs({ format: 'json' })
      downloadBlob(blob, `admin-audit-logs-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Audit logs exported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-muted-foreground" />
          Admin action logs
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExport}
          disabled={exportLoading || logs.length === 0}
        >
          <FileDown className="h-4 w-4" />
          {exportLoading ? 'Exporting…' : 'Export'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Recent admin actions with operator id, timestamp, and justification. All actions are audited.
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No admin action logs yet. Actions such as user disable, resend verification, and replay are recorded here.
          </p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {(logs ?? []).map((log) => (
              <div
                key={log.actionId}
                className={cn(
                  'rounded-lg border border-border px-3 py-2 text-sm',
                  'transition-colors hover:bg-muted/50'
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-accent/10 text-accent border-accent/30"
                  >
                    {log.actionType}
                  </Badge>
                  <span className="text-muted-foreground truncate" title={log.targetResource}>
                    {log.targetResource || '—'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate" title={log.justification}>
                  {log.justification || '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'} · {log.result}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
