/**
 * Ingest Monitor types
 * Maps to backend models with runtime validation support
 */

export type PipelineStage = 'fetch' | 'normalize' | 'store' | 'index'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export type ErrorStatus = 'pending' | 'in_progress' | 'resolved'

export type DLQStatus = 'pending' | 'executed'

export interface SourceMetrics {
  id: string
  name: string
  lastFetchAt?: string
  itemsProcessed: number
  errors: number
  retryCount: number
  rateLimitUsed: number
  rateLimitTotal: number
  status?: HealthStatus
  sparklineData?: number[]
}

export interface IngestMetricsResponse {
  data: SourceMetrics[] | null
  count: number
}

export interface IngestError {
  id: string
  sourceId: string
  timestamp: string
  message: string
  stackTrace?: string | null
  retryCount: number
  status: ErrorStatus
}

export interface IngestErrorsResponse {
  data: IngestError[]
  nextPage?: string
}

export interface PipelineNode {
  id: string
  stage: PipelineStage
  label: string
  health: HealthStatus
  backlogSize?: number
  processedCount?: number
  errorCount?: number
  provenance?: string
}

export interface PipelineEdge {
  from: string
  to: string
}

export interface PipelineGraphData {
  nodes: PipelineNode[]
  edges: PipelineEdge[]
}

export interface DLQEntry {
  id: string
  sourceId: string
  payload: Record<string, unknown>
  reason: string
  createdAt: string
  retryCount: number
  status: DLQStatus
}

export interface DLQResponse {
  data: DLQEntry[]
}

export interface IngestQueue {
  id: string
  sourceId: string
  stage: PipelineStage
  backlogSize: number
  processedCount: number
  errorCount: number
}

export interface HealthComponent {
  id: string
  component: string
  status: HealthStatus
  lastChecked: string
  details?: string
}

export interface IngestHealthResponse {
  components: HealthComponent[]
}

export interface ReplayParams {
  sourceId?: string
  batchId?: string
  idempotencyKey: string
}

export interface ReplayResponse {
  success: boolean
  message?: string
  replayId?: string
}

export interface SummaryStats {
  totalQueueItems: number
  totalErrors: number
  totalRetries: number
  avgProcessingTimeMs?: number
}

/** Internal metrics endpoint response (latency, throughput) */
export interface IngestMetricsInternalResponse {
  ingest_count?: number
  success_count?: number
  failure_count?: number
  latency_p50_ms?: number
  latency_p95_ms?: number
  throughput_per_min?: number
  rate_limits_used?: number
}

/** Transcript batch ingestion types */
export type BatchStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial'

export interface TranscriptBatchRequest {
  batch_manifest_url?: string
  batch_id: string
  company: string
  ingestion_window?: string
}

export interface TranscriptBatchStatus {
  batch_id: string
  status: BatchStatus
  total_items: number
  processed: number
  failed: number
  skipped: number
  started_at?: string
  completed_at?: string
  errors?: Array<{ item_id: string; message: string; error_code?: string }>
}

export interface ReplayRequest {
  raw_payload_id: string
  narrative_event_id?: string
  force?: boolean
}
