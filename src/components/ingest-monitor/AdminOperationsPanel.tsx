import { ReplayControl } from './ReplayControl'
import { DLQManager } from './DLQManager'
import { UserSupportActions } from './UserSupportActions'
import { IngestSystemHealthPanel } from './IngestSystemHealthPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  /** Callback for system health empty state CTA (e.g. refresh health) */
  onHealthRefresh?: () => void
  /** When true, health refresh button shows loading */
  isHealthRefreshing?: boolean
  /** Callback for DLQ empty state CTA (e.g. refetch DLQ) */
  onDLQRefresh?: () => void
  /** When true, DLQ refresh button shows loading */
  isDLQRefreshing?: boolean
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
  onHealthRefresh,
  isHealthRefreshing = false,
  onDLQRefresh,
  isDLQRefreshing = false,
}: AdminOperationsPanelProps) {
  const safeSources = Array.isArray(sources) ? sources : []
  const safeDLQ = Array.isArray(dlqEntries) ? dlqEntries : []
  const safeHealth = Array.isArray(healthComponents) ? healthComponents : []

  const isLoading = isReplayLoading || isDLQLoading || isHealthLoading

  if (isLoading) {
    return (
      <section
        aria-label="Admin operations"
        aria-busy="true"
        aria-live="polite"
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="space-y-6" role="presentation">
          <Card className="card-surface" aria-hidden="true">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Replay control</CardTitle>
              <Skeleton className="h-4 w-56 rounded-md" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </CardContent>
          </Card>
          <Card className="card-surface" aria-hidden="true">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Dead letter queue</CardTitle>
              <Skeleton className="h-4 w-48 rounded-md" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[240px] w-full rounded-lg" aria-hidden="true" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6" role="presentation">
          <Card className="card-surface" aria-hidden="true">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">System health</CardTitle>
              <Skeleton className="h-8 w-14 rounded-md" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="card-surface" aria-hidden="true">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">User support actions</CardTitle>
              <Skeleton className="h-4 w-52 rounded-md" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Admin operations"
      className="grid gap-6 lg:grid-cols-2"
    >
      <section
        aria-label="Replay control and dead letter queue"
        className="space-y-6"
      >
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
          onEmptyStateCta={onDLQRefresh}
          emptyStateCtaLabel="Refresh"
          isRefreshing={isDLQRefreshing}
        />
      </section>
      <section
        aria-label="System health and user support actions"
        className="space-y-6"
      >
        <IngestSystemHealthPanel
          components={safeHealth}
          isLoading={isHealthLoading}
          onRefresh={onHealthRefresh}
          isRefreshing={isHealthRefreshing}
        />
        <UserSupportActions />
      </section>
    </section>
  )
}
