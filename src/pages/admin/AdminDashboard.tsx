import { useState } from 'react'
import {
  IngestionOverviewPanel,
  SystemHealthPanel,
  AdminNotificationsBar,
  QuickAccessTiles,
  AdminActionsPanel,
  UserManagementShortcutCard,
  IngestMonitorPanel,
  ActivityAuditExportPanel,
  HealthStatusCard,
} from '@/components/admin-dashboard'
import {
  useIngestionStatus,
  useSystemHealth,
  useAdminActions,
  useIngestMonitor,
  useUserSummary,
  useAdminNotifications,
  useAdminHealth,
  useAdminIngestStatus,
} from '@/hooks/useAdminDashboard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Skeleton layout matching the dashboard grid for loading states */
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in-up" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-[10px] border border-border bg-card shadow-card">
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="rounded-[10px] border border-border bg-card shadow-card">
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
          <Skeleton className="h-32 w-full rounded-[10px]" />
        </div>
      </div>
      <Card className="rounded-[10px] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[10px] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full rounded-lg mb-4" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-[10px] border border-border bg-card shadow-card">
            <CardHeader>
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full rounded-lg mb-4" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-36 w-full rounded-[10px]" />
          <Skeleton className="h-48 w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [sourceFilter, setSourceFilter] = useState('all')
  const [timeWindow, setTimeWindow] = useState('24h')
  const [dismissedError, setDismissedError] = useState(false)

  const {
    data: ingestionData,
    isLoading: ingestionLoading,
    isError: ingestionError,
    error: ingestionErr,
    refetch: refetchIngestion,
  } = useIngestionStatus()
  const {
    data: healthData,
    isLoading: healthLoading,
    isError: healthError,
    error: healthErr,
    refetch: refetchHealth,
  } = useSystemHealth()
  const { data: adminHealth } = useAdminHealth()
  const {
    data: ingestStatus,
    isError: ingestStatusError,
    error: ingestStatusErr,
    refetch: refetchIngestStatus,
  } = useAdminIngestStatus()
  const {
    data: actionsData,
    isLoading: actionsLoading,
    isError: actionsError,
    error: actionsErr,
    refetch: refetchActions,
  } = useAdminActions({ limit: 10 })
  const {
    data: ingestMonitorData,
    isLoading: ingestMonitorLoading,
    isError: ingestMonitorError,
    error: ingestMonitorErr,
    refetch: refetchIngestMonitor,
  } = useIngestMonitor()
  const userSummary = useUserSummary()
  const { notifications, dismiss, acknowledge } = useAdminNotifications()

  const ingestionSources = ingestionData?.sources ?? []
  const ingestStatusSources = ingestStatus?.sources ?? []
  const sources =
    ingestionSources.length > 0
      ? ingestionSources
      : ingestStatusSources.map((s) => ({
          id: s.id,
          name: s.name,
          lastIngestTime: undefined,
          throughput: s.throughput,
          errorCount: 0,
          rateLimit: undefined,
          rateLimitWarnings: [],
          status: 'healthy' as const,
        }))
  const queues = healthData?.queues ?? []
  const healthScore = healthData?.healthScore ?? (adminHealth?.status === 'healthy' ? 100 : 80)
  const actions = actionsData?.actions ?? []
  const ingestSources = ingestMonitorData?.sources ?? []

  const hasError =
    !dismissedError &&
    (ingestionError || healthError || actionsError || ingestMonitorError || userSummary.isError || ingestStatusError)
  const firstErrorMessage =
    ingestionError && ingestionErr
      ? ingestionErr instanceof Error
        ? ingestionErr.message
        : 'Failed to load ingestion status'
      : healthError && healthErr
        ? healthErr instanceof Error
          ? healthErr.message
          : 'Failed to load system health'
        : actionsError && actionsErr
          ? actionsErr instanceof Error
            ? actionsErr.message
            : 'Failed to load admin actions'
          : ingestMonitorError && ingestMonitorErr
            ? ingestMonitorErr instanceof Error
              ? ingestMonitorErr.message
              : 'Failed to load ingest monitor'
            : userSummary.isError
              ? 'Failed to load user summary'
              : ingestStatusError && ingestStatusErr
                ? ingestStatusErr instanceof Error
                  ? ingestStatusErr.message
                  : 'Failed to load ingest status'
                : 'Something went wrong'

  const refetchAll = () => {
    setDismissedError(false)
    refetchIngestion()
    refetchHealth()
    refetchIngestStatus()
    refetchActions()
    refetchIngestMonitor()
  }

  const isInitialLoading = ingestionLoading || healthLoading

  return (
    <main
      id="admin-dashboard"
      className="min-h-0 space-y-6 animate-fade-in-up"
      aria-labelledby="admin-dashboard-title"
      role="main"
    >
      <h1
        id="admin-dashboard-title"
        className={cn(
          'text-2xl font-semibold tracking-tight text-foreground',
          'sm:text-3xl'
        )}
      >
        Admin dashboard
      </h1>

      {hasError && (
        <section aria-label="Error feedback" className="space-y-2">
          <ErrorBanner
            message={firstErrorMessage}
            onDismiss={() => setDismissedError(true)}
            role="alert"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="gap-2 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Retry loading all dashboard data"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Retry
          </Button>
        </section>
      )}

      <AdminNotificationsBar
        notifications={notifications ?? []}
        onDismiss={dismiss}
        onAcknowledge={acknowledge}
      />

      {isInitialLoading ? (
        <AdminDashboardSkeleton />
      ) : (
        <>
          {/* Ingestion Overview & System Health */}
          <section
            className="grid gap-6 lg:grid-cols-3"
            aria-label="Ingestion and system health"
          >
            <div className="lg:col-span-2">
              <IngestionOverviewPanel
                sources={sources}
                isLoading={ingestionLoading}
                sourceFilter={sourceFilter}
                onSourceFilterChange={setSourceFilter}
                timeWindow={timeWindow}
                onTimeWindowChange={setTimeWindow}
              />
            </div>
            <div className="space-y-6">
              <SystemHealthPanel
                queues={queues}
                healthScore={healthScore}
                isLoading={healthLoading}
              />
              <HealthStatusCard />
            </div>
          </section>

          {/* Quick Access Tiles */}
          <section
            className="grid gap-6"
            aria-label="Quick access to admin tools"
          >
            <QuickAccessTiles />
          </section>

          {/* Activity & Audit Export */}
          <section
            className="grid gap-6"
            aria-label="Activity and audit export"
          >
            <ActivityAuditExportPanel />
          </section>

          {/* Admin Actions & User Management & Ingest Monitor */}
          <section
            className="grid gap-6 lg:grid-cols-3"
            aria-label="Admin actions, user management, and ingest monitor"
          >
            <div className="lg:col-span-2">
              <AdminActionsPanel
                actions={actions}
                isLoading={actionsLoading}
              />
            </div>
            <div className="space-y-6">
              <UserManagementShortcutCard
                totalUsers={userSummary.total}
                activeCount={userSummary.active}
                disabledCount={userSummary.disabled}
                recentVerifications={userSummary.recentVerifications}
                isLoading={userSummary.isLoading}
              />
              <IngestMonitorPanel
                sources={ingestSources}
                isLoading={ingestMonitorLoading}
              />
            </div>
          </section>
        </>
      )}
    </main>
  )
}
