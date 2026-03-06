import { useState } from 'react'
import {
  IngestionOverviewPanel,
  SystemHealthPanel,
  AdminNotificationsBar,
  QuickAccessTiles,
  AdminActionsPanel,
  UserManagementShortcutCard,
  IngestMonitorPanel,
} from '@/components/admin-dashboard'
import {
  useIngestionStatus,
  useSystemHealth,
  useAdminActions,
  useIngestMonitor,
  useUserSummary,
  useAdminNotifications,
} from '@/hooks/useAdminDashboard'

export function AdminDashboard() {
  const [sourceFilter, setSourceFilter] = useState('all')
  const [timeWindow, setTimeWindow] = useState('24h')

  const { data: ingestionData, isLoading: ingestionLoading } = useIngestionStatus()
  const { data: healthData, isLoading: healthLoading } = useSystemHealth()
  const { data: actionsData, isLoading: actionsLoading } = useAdminActions({ limit: 10 })
  const { data: ingestMonitorData, isLoading: ingestMonitorLoading } = useIngestMonitor()
  const userSummary = useUserSummary()
  const { notifications, dismiss, acknowledge } = useAdminNotifications()

  const sources = ingestionData?.sources ?? []
  const queues = healthData?.queues ?? []
  const healthScore = healthData?.healthScore ?? 100
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
        <div>
          <SystemHealthPanel
            queues={queues}
            healthScore={healthScore}
            isLoading={healthLoading}
          />
        </div>
      </div>

      {/* Quick Access Tiles */}
      <QuickAccessTiles />

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
