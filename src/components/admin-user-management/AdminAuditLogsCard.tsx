/**
 * Admin action audit logs - displays recent AdminActionAudit entries with filters and export
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollText, FileDown, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuditLogs } from '@/hooks/useAdminDashboard'
import { adminDashboardApi } from '@/api/admin-dashboard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/profile/EmptyState'

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
  const { data, isLoading, isError, error, refetch } = useAuditLogs({ limit: 10 })

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
    <Card
      className="card-surface transition-all duration-200 hover:shadow-card-hover"
      aria-labelledby="admin-audit-logs-title"
      aria-busy={isLoading}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle id="admin-audit-logs-title" className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <ScrollText className="h-5 w-5 text-muted-foreground" aria-hidden />
          Admin action logs
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={handleExport}
          disabled={exportLoading || logs.length === 0}
          aria-busy={exportLoading}
          aria-label={exportLoading ? 'Exporting audit logs' : 'Export admin audit logs as JSON'}
        >
          <FileDown className="h-4 w-4" aria-hidden />
          {exportLoading ? 'Exporting…' : 'Export'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Recent admin actions with operator id, timestamp, and justification. All actions are audited.
        </p>
        {isLoading ? (
          <div
            className="space-y-2 animate-fade-in"
            role="status"
            aria-live="polite"
            aria-label="Loading audit logs"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-muted animate-pulse border border-border"
                style={{ animationDuration: '1.2s' }}
              />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
            title="Unable to load logs"
            description={error instanceof Error ? error.message : 'Something went wrong. Try refreshing.'}
            action={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-card border-border text-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => refetch()}
                aria-label="Retry loading admin audit logs"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            }
          />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No admin action logs yet"
            description="Actions such as user disable, resend verification, and replay are recorded here. Use Refresh to load the latest."
            action={
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => refetch()}
                aria-label="Refresh admin audit logs"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Refresh logs
              </Button>
            }
          />
        ) : (
          <div
            className="space-y-2 max-h-[240px] overflow-y-auto"
            role="list"
            aria-label="Recent admin action logs"
          >
            {(logs ?? []).map((log) => (
              <div
                key={log.actionId}
                role="listitem"
                className={cn(
                  'rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground',
                  'transition-colors duration-200 hover:bg-muted/50'
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-accent/10 text-accent border-accent/30"
                    aria-label={`Action type: ${log.actionType ?? 'unknown'}`}
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
