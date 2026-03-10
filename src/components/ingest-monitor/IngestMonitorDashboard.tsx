import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  SourceTile,
  PipelineGraph,
  RecentErrorLog,
  ManualTriggerCard,
  SummaryPanel,
  AdminOperationsPanel,
} from '@/components/ingest-monitor'
import {
  useIngestMetrics,
  useIngestErrors,
  useIngestHealth,
  useDLQ,
  useIngestReplay,
  useDLQRetry,
  useDLQPurge,
  useTriggerBatch,
  useErrorRetry,
} from '@/hooks/useIngest'
import { ArrowLeft } from 'lucide-react'
import type { PipelineGraphData, SummaryStats, DLQEntry, HealthComponent } from '@/types/ingest'

function buildPipelineGraph(metrics: { id: string; itemsProcessed: number; errors: number }[]): PipelineGraphData {
  const totalProcessed = metrics.reduce((s, m) => s + (m.itemsProcessed ?? 0), 0)
  const totalErrors = metrics.reduce((s, m) => s + (m.errors ?? 0), 0)
  const hasErrors = totalErrors > 0
  return {
    nodes: [
      { id: 'fetch', stage: 'fetch', label: 'Fetch', health: hasErrors ? 'degraded' : 'healthy', backlogSize: 0, processedCount: totalProcessed, errorCount: totalErrors },
      { id: 'normalize', stage: 'normalize', label: 'Normalize', health: 'healthy', backlogSize: 0, processedCount: totalProcessed, errorCount: 0 },
      { id: 'store', stage: 'store', label: 'Store', health: 'healthy', backlogSize: 0, processedCount: totalProcessed, errorCount: 0 },
      { id: 'index', stage: 'index', label: 'Index', health: 'healthy', backlogSize: 0, processedCount: totalProcessed, errorCount: 0 },
    ],
    edges: [
      { from: 'fetch', to: 'normalize' },
      { from: 'normalize', to: 'store' },
      { from: 'store', to: 'index' },
    ],
  }
}

function buildSummaryStats(
  metrics: { itemsProcessed: number; errors: number; retryCount: number }[],
  errors: unknown[]
): SummaryStats {
  const totalQueueItems = metrics.reduce((s, m) => s + (m.itemsProcessed ?? 0), 0)
  const totalErrors = metrics.reduce((s, m) => s + (m.errors ?? 0), 0) + (Array.isArray(errors) ? errors.length : 0)
  const totalRetries = metrics.reduce((s, m) => s + (m.retryCount ?? 0), 0)
  return {
    totalQueueItems,
    totalErrors,
    totalRetries,
  }
}

export function IngestMonitorDashboard() {
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics, isFetching: metricsFetching } = useIngestMetrics(15000)
  const { data: errorsData, isLoading: errorsLoading, refetch: refetchErrors, isFetching: errorsFetching } = useIngestErrors({ page: 1, limit: 20 })
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth, isFetching: healthFetching } = useIngestHealth(15000)
  const { data: dlqData, isLoading: dlqLoading, refetch: refetchDLQ, isFetching: dlqFetching } = useDLQ()

  const replayMutation = useIngestReplay()
  const dlqRetryMutation = useDLQRetry()
  const dlqPurgeMutation = useDLQPurge()
  const triggerMutation = useTriggerBatch()
  const errorRetryMutation = useErrorRetry()

  const sources = metricsData?.data ?? []
  const errors = errorsData?.data ?? []
  const healthComponents = (healthData?.components ?? []) as HealthComponent[]
  const dlqEntries = (dlqData?.data ?? []) as DLQEntry[]

  const pipelineGraph = buildPipelineGraph(sources)
  const summaryStats = buildSummaryStats(sources, errors)

  const handleRetryError = (errorId: string) => {
    return errorRetryMutation.mutateAsync(errorId)
  }

  const handleTriggerBatch = () => {
    return triggerMutation.mutateAsync(`batch-${Date.now()}`)
  }

  const handleReplay = (params: { sourceId?: string; batchId?: string; idempotencyKey: string }) => {
    return replayMutation.mutateAsync(params)
  }

  const handleDLQRetry = (id: string, idempotencyKey: string) => {
    return dlqRetryMutation.mutateAsync({ id, idempotencyKey })
  }

  const handleDLQPurge = (id: string, idempotencyKey: string) => {
    return dlqPurgeMutation.mutateAsync({ id, idempotencyKey })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ingest monitor</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/transcript-ingestion">Transcript batch</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/payloads">Raw payloads & events</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to overview
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="operations">Admin operations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <SummaryPanel
            stats={summaryStats}
            isLoading={metricsLoading}
            onRefresh={() => refetchMetrics()}
            isRefreshing={metricsFetching}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(sources ?? []).map((s) => (
              <SourceTile
                key={s.id}
                sourceId={s.id}
                name={s.name}
                metrics={{
                  lastFetch: s.lastFetchAt,
                  itemsProcessed: s.itemsProcessed ?? 0,
                  errors: s.errors ?? 0,
                  retryCount: s.retryCount ?? 0,
                  rateLimitUsed: s.rateLimitUsed ?? 0,
                  rateLimitTotal: s.rateLimitTotal ?? 0,
                }}
                status={s.status}
                sparklineData={s.sparklineData ?? []}
                isLoading={metricsLoading}
              />
            ))}
          </div>

          <PipelineGraph graphData={pipelineGraph} isLoading={metricsLoading} />

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentErrorLog
              errors={errors}
              onRetry={handleRetryError}
              isLoading={errorsLoading}
              onRefresh={() => refetchErrors()}
              emptyStateCtaLabel="Refresh"
              isRefreshing={errorsFetching}
            />
            <ManualTriggerCard
              onTriggerBatch={handleTriggerBatch}
              isLoading={triggerMutation.isPending}
            />
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <AdminOperationsPanel
            sources={(sources ?? []).map((s) => ({ id: s.id, name: s.name }))}
            dlqEntries={dlqEntries}
            healthComponents={healthComponents}
            onReplay={handleReplay}
            onDLQRetry={handleDLQRetry}
            onDLQPurge={handleDLQPurge}
            isReplayLoading={replayMutation.isPending}
            isDLQLoading={dlqLoading}
            isHealthLoading={healthLoading}
            onHealthRefresh={() => refetchHealth()}
            isHealthRefreshing={healthFetching}
            onDLQRefresh={() => refetchDLQ()}
            isDLQRefreshing={dlqFetching}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
