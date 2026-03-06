import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useSettingsPreferences,
  useUpdateSettingsPreferences,
} from '@/hooks/useSettings'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PREFERENCES } from '@/types/settings'
import { Bell, Mail, FileDown, RotateCcw } from 'lucide-react'

export function NotificationPreferencesPanel() {
  const { data: prefs, isLoading } = useSettingsPreferences()
  const updatePrefs = useUpdateSettingsPreferences()
  const [ingestNotifications, setIngestNotifications] = useState(
    DEFAULT_PREFERENCES.ingestNotifications
  )
  const [weeklySummary, setWeeklySummary] = useState(DEFAULT_PREFERENCES.weeklySummary)
  const [exportNotifications, setExportNotifications] = useState(
    DEFAULT_PREFERENCES.exportNotifications
  )

  useEffect(() => {
    if (prefs) {
      setIngestNotifications(prefs.ingestNotifications ?? DEFAULT_PREFERENCES.ingestNotifications)
      setWeeklySummary(prefs.weeklySummary ?? DEFAULT_PREFERENCES.weeklySummary)
      setExportNotifications(prefs.exportNotifications ?? DEFAULT_PREFERENCES.exportNotifications)
    }
  }, [prefs])

  const handleSave = () => {
    updatePrefs.mutate(
      {
        ingestNotifications,
        weeklySummary,
        exportNotifications,
      },
      { onSuccess: () => {} }
    )
  }

  const handleReset = () => {
    setIngestNotifications(DEFAULT_PREFERENCES.ingestNotifications)
    setWeeklySummary(DEFAULT_PREFERENCES.weeklySummary)
    setExportNotifications(DEFAULT_PREFERENCES.exportNotifications)
    updatePrefs.mutate(DEFAULT_PREFERENCES, { onSuccess: () => {} })
  }

  const hasChanges =
    ingestNotifications !== (prefs?.ingestNotifications ?? DEFAULT_PREFERENCES.ingestNotifications) ||
    weeklySummary !== (prefs?.weeklySummary ?? DEFAULT_PREFERENCES.weeklySummary) ||
    exportNotifications !== (prefs?.exportNotifications ?? DEFAULT_PREFERENCES.exportNotifications)

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified. Changes apply immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors duration-150">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="ingest-notifications" className="font-medium cursor-pointer">
                Ingestion issue emails
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get notified when data ingestion fails or encounters errors.
              </p>
            </div>
          </div>
          <Switch
            id="ingest-notifications"
            checked={ingestNotifications}
            onCheckedChange={setIngestNotifications}
            aria-label="Toggle ingestion issue emails"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors duration-150">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="weekly-summary" className="font-medium cursor-pointer">
                Weekly summary
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Receive a weekly digest of IPI changes and narrative highlights.
              </p>
            </div>
          </div>
          <Switch
            id="weekly-summary"
            checked={weeklySummary}
            onCheckedChange={setWeeklySummary}
            aria-label="Toggle weekly summary"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors duration-150">
          <div className="flex items-start gap-3">
            <FileDown className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label htmlFor="export-notifications" className="font-medium cursor-pointer">
                Export completion notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get notified when your audit export is ready for download.
              </p>
            </div>
          </div>
          <Switch
            id="export-notifications"
            checked={exportNotifications}
            onCheckedChange={setExportNotifications}
            aria-label="Toggle export completion notifications"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={!hasChanges || updatePrefs.isPending}>
            {updatePrefs.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
