/**
 * Transcript Batch Ingestion Dashboard (page_admin_004)
 * Batch upload, manifest uploader, batch status, replay controls
 */
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BatchUploadPanel, BatchStatusView } from '@/components/transcript-ingestion'
import { DLQManager } from '@/components/ingest-monitor'
import { useTranscriptBatchSubmit, useTranscriptBatchStatus, useTranscriptBatchStatusRefetch, useDLQ, useDLQRetry, useDLQPurge } from '@/hooks/useTranscriptIngestion'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { DLQEntry } from '@/types/ingest'

export function TranscriptIngestionDashboard() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [pollBatchId, setPollBatchId] = useState<string | null>(null)

  const submitMutation = useTranscriptBatchSubmit()
  const { data: batchStatus, isLoading: statusLoading } = useTranscriptBatchStatus(pollBatchId)
  const refetchStatus = useTranscriptBatchStatusRefetch(pollBatchId)
  const { data: dlqData } = useDLQ()
  const dlqRetryMutation = useDLQRetry()
  const dlqPurgeMutation = useDLQPurge()

  const dlqEntries = (dlqData?.data ?? []) as DLQEntry[]

  const handleFilesSelected = useCallback((_files: File[]) => {
    // Files selected - user would need a submit button; for now we support manifest flow
    // Could extend to upload files to S3 and then submit manifest URL
  }, [])

  const handleManifestSubmit = useCallback(
    async (manifestUrl: string, batchId: string, company: string) => {
      try {
        const res = await submitMutation.mutateAsync({
          batch_manifest_url: manifestUrl,
          batch_id: batchId,
          company,
        })
        setSelectedBatchId(res?.batch_id ?? batchId)
        setPollBatchId(res?.batch_id ?? batchId)
        toast.success(`Batch ${res?.batch_id ?? batchId} submitted`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Batch submit failed')
      }
    },
    [submitMutation]
  )

  const handleRefreshStatus = useCallback(() => {
    refetchStatus()
  }, [refetchStatus])

  const handleDLQRetry = useCallback(
    (id: string, idempotencyKey: string) => dlqRetryMutation.mutateAsync({ id, idempotencyKey }),
    [dlqRetryMutation]
  )

  const handleDLQPurge = useCallback(
    (id: string, idempotencyKey: string) => dlqPurgeMutation.mutateAsync({ id, idempotencyKey }),
    [dlqPurgeMutation]
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Transcript batch ingestion</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to overview
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Upload & status</TabsTrigger>
          <TabsTrigger value="dlq">Dead letter queue</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BatchUploadPanel
              onFilesSelected={handleFilesSelected}
              onManifestSubmit={handleManifestSubmit}
              isSubmitting={submitMutation.isPending}
              disabled={submitMutation.isPending}
            />
            <BatchStatusView
              status={batchStatus ?? null}
              isLoading={statusLoading}
              onRefresh={handleRefreshStatus}
            />
          </div>

          {selectedBatchId && (
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Tracking batch <span className="font-mono font-medium text-foreground">{selectedBatchId}</span>.
                Status refreshes automatically.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshStatus}
                >
                  Refresh status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBatchId(null)
                    setPollBatchId(null)
                  }}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dlq" className="mt-6">
          <DLQManager
            entries={dlqEntries}
            onRetry={handleDLQRetry}
            onPurge={handleDLQPurge}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
