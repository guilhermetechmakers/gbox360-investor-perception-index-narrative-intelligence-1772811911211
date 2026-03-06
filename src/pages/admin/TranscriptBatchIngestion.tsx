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
  Database,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

const INITIAL_FORM: TranscriptBatchRequest = {
  batch_id: '',
  company: '',
  batch_manifest_url: '',
  ingestion_window: '',
}

export function TranscriptBatchIngestion() {
  const [form, setForm] = useState<TranscriptBatchRequest>(INITIAL_FORM)
  const [statusBatchId, setStatusBatchId] = useState<string | null>(null)

  const submitBatch = useTranscriptBatchSubmit()
  const { data: batchStatus, isLoading: statusLoading } = useBatchStatus(statusBatchId, 5000)
  const replayPayload = useIngestReplayPayload()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const batchId = (form.batch_id ?? '').trim()
      const company = (form.company ?? '').trim()
      if (!batchId || !company) {
        toast.error('Batch ID and Company are required')
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
            <Link to="/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transcript batch ingestion
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/ingest-monitor">Ingest monitor</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/payloads">Raw payloads</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5" />
                Submit batch
              </CardTitle>
              <CardDescription>
                Provide a batch manifest URL (S3 or storage) and company. The batch loader will
                read the manifest and ingest transcripts with idempotent deduplication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch_id">Batch ID</Label>
                  <Input
                    id="batch_id"
                    placeholder="e.g. batch-2024-q1-aapl"
                    value={form.batch_id ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, batch_id: e.target.value }))
                    }
                    disabled={isFormDisabled}
                    aria-required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g. AAPL or Apple Inc."
                    value={form.company ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, company: e.target.value }))
                    }
                    disabled={isFormDisabled}
                    aria-required
                  />
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
                  />
                </div>
                <Button type="submit" disabled={isFormDisabled} className="w-full sm:w-auto">
                  {submitBatch.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit batch
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
                <FileJson className="h-5 w-5" />
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
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[66%]" />
                    </div>
                  ) : batchStatus ? (
                    <BatchStatusView
                      status={batchStatus}
                      onReplayFailed={handleReplayFailed}
                      isReplaying={replayPayload.isPending}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No status data yet. Refreshing…
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatusBatchId(null)}
                    >
                      Clear selection
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  <Database className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-2">Submit a batch above to see status here.</p>
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
              <AlertCircle className="h-5 w-5 text-destructive" />
              Failed items
            </CardTitle>
            <CardDescription>
              Items that could not be processed; use replay from Ingest Monitor or Raw Payloads
              if raw_payload_id is available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {errors.slice(0, 10).map((err, i) => (
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
          <p className="text-lg font-semibold text-emerald-600">
            {status.processed ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-semibold text-red-600">
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
