/**
 * Transcript Batch Ingestion (page_admin_004)
 * Admin uploads earnings transcripts via batch manifest; view status and replay failed items.
 * All array/state guarded per runtime safety rules.
 */
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useTranscriptBatchSubmit,
  useBatchStatus,
  useIngestReplayPayload,
} from '@/hooks/useIngest'
import { ensureArray } from '@/lib/runtime-safe'
import type { TranscriptBatchRequest, BatchStatus as BatchStatusType } from '@/types/ingest'
import {
  ArrowLeft,
  Upload,
  FileJson,
  AlertCircle,
  Loader2,
  Inbox,
} from 'lucide-react'
import { toast } from 'sonner'

const INITIAL_FORM: TranscriptBatchRequest = {
  batch_id: '',
  company: '',
  batch_manifest_url: '',
  ingestion_window: '',
}

type FormErrors = { batch_id?: string; company?: string }

export function TranscriptBatchIngestion() {
  const [form, setForm] = useState<TranscriptBatchRequest>(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [statusBatchId, setStatusBatchId] = useState<string | null>(null)

  const submitBatch = useTranscriptBatchSubmit()
  const { data: batchStatus, isLoading: statusLoading } = useBatchStatus(statusBatchId, 5000)
  const replayPayload = useIngestReplayPayload()

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setFormErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const batchId = (form.batch_id ?? '').trim()
      const company = (form.company ?? '').trim()
      const errors: FormErrors = {}
      if (!batchId) errors.batch_id = 'Batch ID is required'
      if (!company) errors.company = 'Company is required'
      setFormErrors(errors)
      if (Object.keys(errors).length > 0) {
        toast.error('Please fix the errors below')
        return
      }
      submitBatch.mutate(
        {
          batch_id: batchId,
          company,
          batch_manifest_url: (form.batch_manifest_url ?? '').trim() || undefined,
          ingestion_window: (form.ingestion_window ?? '').trim() || undefined,
        },
        {
          onSuccess: (data) => {
            const id = data?.batch_id ?? batchId
            setStatusBatchId(id)
            setFormErrors({})
          },
        }
      )
    },
    [form, submitBatch]
  )

  const handleReplayFailed = useCallback(
    (rawPayloadId: string) => {
      replayPayload.mutate(
        { raw_payload_id: rawPayloadId },
        {
          onSuccess: () => {
            if (statusBatchId) {
              // Refetch will happen via query invalidation
            }
          },
        }
      )
    },
    [replayPayload, statusBatchId]
  )

  const errors = ensureArray(batchStatus?.errors)
  const isFormDisabled = submitBatch.isPending

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin" className="gap-2" aria-label="Back to admin overview">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to overview
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transcript batch ingestion
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/ingest-monitor" aria-label="Go to ingest monitor">
              Ingest monitor
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/payloads" aria-label="Go to raw payloads">
              Raw payloads
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5" aria-hidden />
                Submit batch
              </CardTitle>
              <CardDescription>
                Provide a batch manifest URL (S3 or storage) and company. The batch loader will
                read the manifest and ingest transcripts with idempotent deduplication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="batch_id">Batch ID</Label>
                  <Input
                    id="batch_id"
                    placeholder="e.g. batch-2024-q1-aapl"
                    value={form.batch_id ?? ''}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, batch_id: e.target.value }))
                      clearFieldError('batch_id')
                    }}
                    disabled={isFormDisabled}
                    aria-required
                    aria-invalid={!!formErrors.batch_id}
                    aria-describedby={formErrors.batch_id ? 'batch_id-error' : undefined}
                  />
                  {formErrors.batch_id && (
                    <p
                      id="batch_id-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formErrors.batch_id}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g. AAPL or Apple Inc."
                    value={form.company ?? ''}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, company: e.target.value }))
                      clearFieldError('company')
                    }}
                    disabled={isFormDisabled}
                    aria-required
                    aria-invalid={!!formErrors.company}
                    aria-describedby={formErrors.company ? 'company-error' : undefined}
                  />
                  {formErrors.company && (
                    <p
                      id="company-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formErrors.company}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_manifest_url">Manifest URL (optional)</Label>
                  <Input
                    id="batch_manifest_url"
                    placeholder="https://bucket.s3.../manifests/batch-id.json"
                    value={form.batch_manifest_url ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        batch_manifest_url: e.target.value,
                      }))
                    }
                    disabled={isFormDisabled}
                    aria-label="Batch manifest URL (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingestion_window">Ingestion window (optional)</Label>
                  <Input
                    id="ingestion_window"
                    placeholder="e.g. 2024-01-01/2024-03-31"
                    value={form.ingestion_window ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ingestion_window: e.target.value,
                      }))
                    }
                    disabled={isFormDisabled}
                    aria-label="Ingestion window date range (optional)"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  className="w-full sm:w-auto"
                  aria-busy={isFormDisabled ? 'true' : 'false'}
                  aria-disabled={isFormDisabled}
                >
                  {submitBatch.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span>Submitting…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" aria-hidden />
                      <span>Submit batch</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileJson className="h-5 w-5" aria-hidden />
                Batch status
              </CardTitle>
              <CardDescription>
                Polling status for the selected batch. Use a batch ID above and submit to start.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusBatchId ? (
                <>
                  {statusLoading && !batchStatus ? (
                    <div className="space-y-3" aria-live="polite" aria-busy="true">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[66%]" />
                      <p className="text-xs text-muted-foreground">Loading batch status…</p>
                    </div>
                  ) : statusLoading && batchStatus ? (
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 transition-opacity duration-200"
                        aria-live="polite"
                      >
                        <span className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Updating…
                        </span>
                      </div>
                      <BatchStatusView
                        status={batchStatus}
                        onReplayFailed={handleReplayFailed}
                        isReplaying={replayPayload.isPending}
                      />
                    </div>
                  ) : batchStatus ? (
                    <BatchStatusView
                      status={batchStatus}
                      onReplayFailed={handleReplayFailed}
                      isReplaying={replayPayload.isPending}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground" role="status">
                      No status data yet. Refreshing…
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatusBatchId(null)}
                      aria-label="Clear batch selection and hide status"
                    >
                      Clear selection
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <Inbox
                    className="h-12 w-12 text-muted-foreground"
                    aria-hidden
                  />
                  <h3 className="mt-4 text-base font-medium text-foreground">
                    No batch selected
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Submit a batch using the form on the left to see status, progress, and failed
                    items here. Enter a Batch ID and Company, then click Submit batch.
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    You can also open Ingest monitor or Raw payloads from the links above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {batchStatus && errors.length > 0 && (
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
              Failed items
            </CardTitle>
            <CardDescription>
              Items that could not be processed; use replay from Ingest Monitor or Raw Payloads
              if raw_payload_id is available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list">
              {(errors ?? []).slice(0, 10).map((err, i) => (
                <li
                  key={`${err?.item_id ?? i}-${err?.message ?? ''}`}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{err?.item_id ?? '—'}</span>
                  <Badge variant="destructive" className="text-xs">
                    {err?.error_code ?? 'error'}
                  </Badge>
                  <span className="text-muted-foreground">{err?.message ?? ''}</span>
                </li>
              ))}
            </ul>
            {errors.length > 10 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing first 10 of {errors.length} failed items.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface BatchStatusViewProps {
  status: {
    batch_id: string
    status: BatchStatusType
    total_items: number
    processed: number
    failed: number
    skipped?: number
    started_at?: string
    completed_at?: string
    errors?: Array<{ item_id: string; message: string; error_code?: string }>
  }
  onReplayFailed: (rawPayloadId: string) => void
  isReplaying: boolean
}

function BatchStatusView({ status }: BatchStatusViewProps) {
  const statusLabel =
    status.status === 'completed'
      ? 'Completed'
      : status.status === 'failed'
        ? 'Failed'
        : status.status === 'in_progress'
          ? 'In progress'
          : status.status === 'partial'
            ? 'Partial'
            : 'Pending'

  const statusVariant =
    status.status === 'completed'
      ? 'success'
      : status.status === 'failed'
        ? 'destructive'
        : status.status === 'in_progress' || status.status === 'partial'
          ? 'accent'
          : 'secondary'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={statusVariant}>{statusLabel}</Badge>
        <span className="text-sm text-muted-foreground">Batch: {status.batch_id}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{status.total_items ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Processed</p>
          <p className="text-lg font-semibold text-success">
            {status.processed ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-semibold text-destructive">
            {status.failed ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Skipped</p>
          <p className="text-lg font-semibold">{status.skipped ?? 0}</p>
        </div>
      </div>
      {(status.started_at ?? status.completed_at) && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {status.started_at && (
            <span>Started: {new Date(status.started_at).toLocaleString()}</span>
          )}
          {status.completed_at && (
            <span>Completed: {new Date(status.completed_at).toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  )
}
