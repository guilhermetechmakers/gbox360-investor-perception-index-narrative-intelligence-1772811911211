import { ReplayControl } from './ReplayControl'
import { DLQManager } from './DLQManager'
import { UserSupportActions } from './UserSupportActions'
import { IngestSystemHealthPanel } from './IngestSystemHealthPanel'
import type { DLQEntry, HealthComponent } from '@/types/ingest'

interface AdminOperationsPanelProps {
  sources: { id: string; name: string }[]
  dlqEntries: DLQEntry[]
  healthComponents: HealthComponent[]
  onReplay: (params: { sourceId?: string; batchId?: string; idempotencyKey: string }) => Promise<unknown>
  onDLQRetry: (id: string, idempotencyKey: string) => Promise<unknown>
  onDLQPurge: (id: string, idempotencyKey: string) => Promise<unknown>
  isReplayLoading?: boolean
  isDLQLoading?: boolean
  isHealthLoading?: boolean
}

export function AdminOperationsPanel({
  sources = [],
  dlqEntries = [],
  healthComponents = [],
  onReplay,
  onDLQRetry,
  onDLQPurge,
  isReplayLoading = false,
  isDLQLoading = false,
  isHealthLoading = false,
}: AdminOperationsPanelProps) {
  const safeSources = Array.isArray(sources) ? sources : []
  const safeDLQ = Array.isArray(dlqEntries) ? dlqEntries : []
  const safeHealth = Array.isArray(healthComponents) ? healthComponents : []

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <ReplayControl
          sources={safeSources}
          onReplay={onReplay}
          isLoading={isReplayLoading}
        />
        <DLQManager
          entries={safeDLQ}
          onRetry={onDLQRetry}
          onPurge={onDLQPurge}
          isLoading={isDLQLoading}
        />
      </div>
      <div className="space-y-6">
        <IngestSystemHealthPanel
          components={safeHealth}
          isLoading={isHealthLoading}
        />
        <UserSupportActions />
      </div>
    </div>
  )
}
