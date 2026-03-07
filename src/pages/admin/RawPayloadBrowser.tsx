import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  PayloadSearchFilters,
  PayloadList,
  PayloadViewerPanel,
  ProvenancePanel,
  ReplayControl,
  ExportArtifactBuilder,
  RetentionControls,
  AdminDashboardLinkCard,
} from '@/components/payload-browser'
import { SystemHealthPanel } from '@/components/admin-dashboard'
import {
  usePayloads,
  usePayloadDetail,
  useReplayPayload,
  useReplayPayloadsBatch,
  useSetPayloadRetention,
  usePurgePayload,
  useGenerateAuditExport,
  useSystemHealth,
  useUserSummary,
} from '@/hooks/useAdminDashboard'
import { Button } from '@/components/ui/button'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { ArrowLeft } from 'lucide-react'
import type { PayloadSearchFilters as PayloadSearchFiltersType } from '@/types/admin'
import type { RawPayload } from '@/types/admin'

export function RawPayloadBrowser() {
  const [filters, setFilters] = useState<PayloadSearchFiltersType>({
    page: 1,
    pageSize: 20,
  })
  const [selectedPayload, setSelectedPayload] = useState<RawPayload | null>(null)
  const [selectedPayloadIds, setSelectedPayloadIds] = useState<string[]>([])
  const [dismissedError, setDismissedError] = useState(false)

  const { data: payloadsData, isPending: payloadsLoading, isError: payloadsError, error: payloadsErrorDetail, refetch: refetchPayloads } = usePayloads(filters)
  const { data: systemHealth } = useSystemHealth()
  const userSummary = useUserSummary()

  const payloads = Array.isArray(payloadsData?.data) ? payloadsData.data : []
  const total = payloadsData?.count ?? payloadsData?.total ?? 0
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20

  const { data: payloadDetail } = usePayloadDetail(
    selectedPayload?.id ?? null
  )
  const provenance = payloadDetail?.provenance ?? null
  const narrativeEvents = Array.isArray(payloadDetail?.narrativeEvents)
    ? payloadDetail.narrativeEvents
    : []

  const replayPayload = useReplayPayload()
  const replayBatch = useReplayPayloadsBatch()
  const setRetention = useSetPayloadRetention()
  const purgePayload = usePurgePayload()
  const generateExport = useGenerateAuditExport()

  const handleFiltersChange = useCallback((newFilters: PayloadSearchFiltersType) => {
    setFilters(newFilters)
    setDismissedError(false)
  }, [])

  const handlePageChange = useCallback(
    (newPage: number) => {
      setFilters((prev) => ({ ...prev, page: newPage }))
    },
    []
  )

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setFilters((prev) => ({ ...prev, pageSize: newSize, page: 1 }))
    },
    []
  )

  const handleSelectPayloads = useCallback((ids: string[]) => {
    setSelectedPayloadIds(ids)
  }, [])

  const handleRowClick = useCallback((payload: RawPayload) => {
    setSelectedPayload(payload)
  }, [])

  const handleGenerateExport = useCallback(
    (params: {
      narrativeEventIds: string[]
      signingMethod: string
      exportFormat: 'json' | 'pdf'
    }) => {
      generateExport.mutate({
        narrativeEventIds: params.narrativeEventIds,
        signingMethod: params.signingMethod,
        exportFormat: params.exportFormat,
      })
    },
    [generateExport]
  )

  const handleReplayPayload = useCallback(
    (id: string, params?: { idempotencyKey?: string; reason?: string }) => {
      replayPayload.mutate({ id, idempotencyKey: params?.idempotencyKey, reason: params?.reason })
    },
    [replayPayload]
  )

  const handleReplaySelected = useCallback(
    (ids: string[], params?: { idempotencyKey?: string; reason?: string }) => {
      replayBatch.mutate({
        payloadIds: ids,
        idempotencyKey: params?.idempotencyKey,
        reason: params?.reason,
      })
    },
    [replayBatch]
  )

  const queues = systemHealth?.queues ?? []
  const errorMessage = payloadsError && !dismissedError
    ? (payloadsErrorDetail instanceof Error ? payloadsErrorDetail.message : 'Failed to load payloads')
    : null

  return (
    <div className="space-y-6 animate-fade-in-up" role="main" aria-label="Raw Payload Browser and Audit Export">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/admin"
              className="gap-2"
              aria-label="Back to admin overview"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to overview
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Raw Payload Browser &amp; Audit Export</h1>
        </div>
      </div>

      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onDismiss={() => setDismissedError(true)}
          role="alert"
        />
      )}

      <PayloadSearchFilters
        onChangeFilters={handleFiltersChange}
        initialFilters={filters}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <PayloadList
            payloads={payloads}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSelectPayloads={handleSelectPayloads}
            selectedIds={selectedPayloadIds}
            onRowClick={handleRowClick}
            isLoading={payloadsLoading}
            isError={payloadsError && !dismissedError}
            onRetry={refetchPayloads}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SystemHealthPanel
            queues={queues}
            healthScore={systemHealth?.healthScore}
          />
          <AdminDashboardLinkCard
            metrics={{
              userCount: userSummary.total,
              healthScore: systemHealth?.healthScore,
            }}
          />
          <ReplayControl
            selectedPayloadId={selectedPayload?.id}
            selectedPayloadIds={selectedPayloadIds}
            onReplayPayload={handleReplayPayload}
            onReplaySelected={handleReplaySelected}
            isReplaying={replayPayload.isPending || replayBatch.isPending}
          />
        </div>
      </div>

      {selectedPayload && (
        <div className="grid gap-6 lg:grid-cols-12 mt-6 border-t border-border pt-6">
          <div className="lg:col-span-6 space-y-6">
            <PayloadViewerPanel
              payload={selectedPayload}
              onClose={() => setSelectedPayload(null)}
              onReplay={(id) => handleReplayPayload(id)}
              isReplaying={replayPayload.isPending}
            />
            <ProvenancePanel provenanceData={provenance} />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <ExportArtifactBuilder
              selectedNarrativeEvents={narrativeEvents as { id: string }[]}
              onGenerateExport={handleGenerateExport}
              isGenerating={generateExport.isPending}
            />
            <RetentionControls
              payloadsSelected={selectedPayloadIds.map((id) => {
                const p = payloads.find((x) => x.id === id)
                return { id, retentionFlag: p?.retentionFlag ?? false }
              })}
              onMarkRetention={(id, retain) => setRetention.mutate({ id, retain })}
              onPurge={(id) => purgePayload.mutate(id)}
              isAdmin
            />
          </div>
        </div>
      )}
    </div>
  )
}
