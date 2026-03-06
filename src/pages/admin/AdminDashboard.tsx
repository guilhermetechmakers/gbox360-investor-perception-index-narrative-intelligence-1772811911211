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

export function AdminDashboard() {
  const [sourceFilter, setSourceFilter] = useState('all')
  const [timeWindow, setTimeWindow] = useState('24h')

  const { data: ingestionData, isLoading: ingestionLoading } = useIngestionStatus()
  const { data: healthData, isLoading: healthLoading } = useSystemHealth()
  const { data: adminHealth } = useAdminHealth()
  const { data: ingestStatus } = useAdminIngestStatus()
  const { data: actionsData, isLoading: actionsLoading } = useAdminActions({ limit: 10 })
  const { data: ingestMonitorData, isLoading: ingestMonitorLoading } = useIngestMonitor()
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
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>

      <AdminNotificationsBar
        notifications={notifications ?? []}
        onDismiss={dismiss}
        onAcknowledge={acknowledge}
      />

      {/* Ingestion Overview & System Health */}
      <div className="grid gap-6 lg:grid-cols-3">
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
      </div>

      {/* Quick Access Tiles */}
      <QuickAccessTiles />

      {/* Activity & Audit Export */}
      <ActivityAuditExportPanel />

      {/* Admin Actions & User Management & Ingest Monitor */}
      <div className="grid gap-6 lg:grid-cols-3">
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
            isLoading={false}
          />
          <IngestMonitorPanel
            sources={ingestSources}
            isLoading={ingestMonitorLoading}
          />
        </div>
      </div>
    </div>
  )
}
