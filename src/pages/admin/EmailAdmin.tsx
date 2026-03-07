/**
 * Admin Email Dashboard (page_admin_001)
 * Overview of delivery metrics, bounce reasons, opt-out lists, template health, and retries.
 */
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useEmailTemplates,
  useEmailMetrics,
  useEmailQueue,
  useEmailLogs,
  useSendTestEmail,
} from '@/hooks/useEmail'
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { JsonHighlight } from '@/components/drilldown/JsonHighlight'
import { cn } from '@/lib/utils'
import type { EmailLogItem, EmailQueueItem, EmailTemplate } from '@/types/email'
import { format } from 'date-fns'
import { toast } from 'sonner'

function RawPayloadModal({
  open,
  onOpenChange,
  payload,
  receivedAt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload?: unknown
  receivedAt?: string
}) {
  const str =
    typeof payload === 'string'
      ? payload
      : payload != null
        ? JSON.stringify(payload, null, 2)
        : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Raw payload</DialogTitle>
          <DialogDescription>
            {receivedAt ? `Received: ${format(new Date(receivedAt), 'PPpp')}` : 'Audit payload'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 p-4">
          <JsonHighlight content={str} className="text-sm font-mono" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  isLoading,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'destructive' | 'accent'
  isLoading?: boolean
}) {
  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p
                className={cn(
                  'mt-1 text-2xl font-bold tabular-nums',
                  variant === 'success' && 'text-success',
                  variant === 'destructive' && 'text-destructive',
                  variant === 'accent' && 'text-accent',
                  variant === 'default' && 'text-foreground'
                )}
              >
                {value}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TestEmailDialog({
  open,
  onOpenChange,
  templateId,
  templateName,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  templateName: string
  onSuccess?: () => void
}) {
  const [to, setTo] = useState('')
  const sendTest = useSendTestEmail()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!to?.trim()) return
    sendTest.mutate(
      { templateId, to: to.trim() },
      {
        onSuccess: () => {
          onSuccess?.()
          onOpenChange(false)
          setTo('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send test email</DialogTitle>
          <DialogDescription>
            Send a test email for template &quot;{templateName}&quot; to verify content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Recipient email</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="you@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={sendTest.isPending}
              className="focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendTest.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!to?.trim() || sendTest.isPending}>
              {sendTest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send test
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EmailAdmin() {
  const [testDialog, setTestDialog] = useState<{
    templateId: string
    templateName: string
  } | null>(null)
  const [payloadModal, setPayloadModal] = useState<{
    payload: unknown
    receivedAt?: string
  } | null>(null)
  const [logsPage, setLogsPage] = useState(1)

  const { data: templatesResponse, isLoading: templatesLoading, refetch: refetchTemplates, isFetching: templatesFetching } = useEmailTemplates()
  const { data: metricsResponse, isLoading: metricsLoading } = useEmailMetrics()
  const { data: queueResponse, isLoading: queueLoading } = useEmailQueue()
  const { data: logsData, isLoading: logsLoading } = useEmailLogs({
    page: logsPage,
    limit: 10,
  })

  const isPageLoading = templatesLoading && metricsLoading
  const hasInitialData = templatesResponse != null || metricsResponse != null

  const metrics = (metricsResponse?.metrics ?? metricsResponse ?? {}) as Record<string, number | undefined>
  const templatesList: EmailTemplate[] = Array.isArray((templatesResponse as unknown as { templates?: EmailTemplate[] })?.templates)
    ? ((templatesResponse as unknown as { templates: EmailTemplate[] }).templates ?? [])
    : []
  const queueList: EmailQueueItem[] = Array.isArray((queueResponse as unknown as { items?: EmailQueueItem[] })?.items)
    ? ((queueResponse as unknown as { items: EmailQueueItem[] }).items ?? [])
    : []
  const logs: EmailLogItem[] = Array.isArray((logsData as unknown as { logs?: EmailLogItem[] })?.logs)
    ? ((logsData as unknown as { logs: EmailLogItem[] }).logs ?? [])
    : []
  const logsCount = (logsData as unknown as { count?: number })?.count ?? 0

  const handleRefreshTemplates = () => {
    refetchTemplates().then((result) => {
      if (result.isError && result.error) {
        toast.error((result.error as Error)?.message ?? 'Failed to refresh templates')
      } else {
        toast.success('Templates refreshed')
      }
    })
  }

  if (isPageLoading && !hasInitialData) {
    return (
      <div
        className="space-y-8 animate-fade-in-up"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading email admin data"
      >
        <div>
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Card className="card-surface">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery metrics, template health, queue status, and audit logs
        </p>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Deliveries"
          value={metrics?.delivered ?? metrics?.deliveries ?? 0}
          icon={CheckCircle2}
          variant="success"
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Opens"
          value={metrics?.sent ?? metrics?.opens ?? 0}
          icon={Mail}
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Bounces"
          value={metrics?.bounced ?? metrics?.bounces ?? 0}
          icon={XCircle}
          variant="destructive"
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Failures"
          value={metrics?.failed ?? metrics?.failures ?? 0}
          icon={AlertCircle}
          variant="destructive"
          isLoading={metricsLoading}
        />
        <MetricCard
          label="Retries"
          value={metrics?.queued ?? metrics?.retries ?? 0}
          icon={RefreshCw}
          variant="accent"
          isLoading={metricsLoading}
        />
      </div>

      {/* Templates table */}
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates
          </CardTitle>
          <CardDescription>
            Transactional email templates with version and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : templatesList.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-muted/20 py-12 px-4 text-center transition-shadow duration-200"
              role="status"
              aria-live="polite"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-hidden
              >
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-foreground">No templates found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Run migrations to seed default templates, or refresh to load templates from the server.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-4 bg-[#0F172A] text-primary-foreground hover:bg-[#0F172A]/90 focus-visible:ring-[#93C5FD]"
                onClick={handleRefreshTemplates}
                disabled={templatesFetching}
                aria-busy={templatesFetching}
                aria-label={templatesFetching ? 'Refreshing templates' : 'Refresh templates'}
              >
                {templatesFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Refreshing…
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                    Refresh templates
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium">Name</th>
                    <th className="pb-3 text-left font-medium">Subject</th>
                    <th className="pb-3 text-left font-medium">Version</th>
                    <th className="pb-3 text-left font-medium">Last updated</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templatesList.map((t: { id: string; name: string; subject: string; version: number; lastUpdatedAt?: string; last_updated_at?: string; active: boolean }) => (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="py-3 font-medium">{t.name}</td>
                      <td className="py-3 text-muted-foreground max-w-[200px] truncate">
                        {t.subject}
                      </td>
                      <td className="py-3 tabular-nums">{t.version}</td>
                      <td className="py-3 text-muted-foreground">
                        {(() => {
                          const ts = (t as { last_updated_at?: string; lastUpdatedAt?: string }).last_updated_at ?? (t as { lastUpdatedAt?: string }).lastUpdatedAt
                          return ts ? format(new Date(ts), 'MMM d, yyyy') : '—'
                        })()}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            t.active
                              ? 'bg-success/20 text-success'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {t.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setTestDialog({
                              templateId: t.id,
                              templateName: t.name,
                            })
                          }
                          className="h-8"
                        >
                          <Send className="h-4 w-4" />
                          Test
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue & Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Queue
            </CardTitle>
            <CardDescription>Recent queued and sent messages</CardDescription>
          </CardHeader>
          <CardContent>
            {queueLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : queueList.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No items in queue
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {queueList.slice(0, 10).map((q) => {
                  const row = q as unknown as Record<string, unknown>
                  const created = row.created_at ?? row.createdAt
                  const retries = row.retry_count ?? row.retryCount
                  return (
                    <div
                      key={String(row.id ?? q.id)}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 truncate">
                        <p className="font-medium truncate">{String(row.to ?? q.to)}</p>
                        <p className="text-xs text-muted-foreground">
                          {String(row.status ?? q.status)} · {Number(retries ?? 0)} retries
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {created ? format(new Date(created as string), 'MMM d, HH:mm') : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Audit logs
            </CardTitle>
            <CardDescription>Raw payload logs for audit</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No audit logs
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 truncate">
                      <p className="font-medium truncate">{log.to}</p>
                      <p className="text-xs text-muted-foreground">
                        {(log.templateId ?? log.template_id ?? '—')} · {log.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          setPayloadModal({
                            payload: log.rawPayload ?? {},
                            receivedAt: log.receivedAt,
                          })
                        }
                      >
                        View payload
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {(log.receivedAt ?? log.created_at)
                          ? format(new Date(log.receivedAt ?? log.created_at ?? ''), 'MMM d')
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))}
                {logsCount > 10 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsPage <= 1}
                      onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsPage * 10 >= logsCount}
                      onClick={() => setLogsPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {testDialog && (
        <TestEmailDialog
          open={!!testDialog}
          onOpenChange={(open) => !open && setTestDialog(null)}
          templateId={testDialog.templateId}
          templateName={testDialog.templateName}
        />
      )}

      {payloadModal && (
        <RawPayloadModal
          open={!!payloadModal}
          onOpenChange={(open) => !open && setPayloadModal(null)}
          payload={payloadModal.payload}
          receivedAt={payloadModal.receivedAt}
        />
      )}
    </div>
  )
}
