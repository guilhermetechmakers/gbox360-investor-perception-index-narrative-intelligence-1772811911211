import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Mail, FileDown } from 'lucide-react'
import {
  useSettingsPreferences,
  useUpdateSettingsPreferences,
} from '@/hooks/useSettings'
import { DEFAULT_PREFERENCES } from '@/types/settings'

export function PreferencesPanel() {
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
      queueMicrotask(() => {
        setIngestNotifications(prefs.ingestNotifications ?? DEFAULT_PREFERENCES.ingestNotifications)
        setWeeklySummary(prefs.weeklySummary ?? DEFAULT_PREFERENCES.weeklySummary)
        setExportNotifications(prefs.exportNotifications ?? DEFAULT_PREFERENCES.exportNotifications)
      })
    }
  }, [prefs])

  const handleSave = () => {
    updatePrefs.mutate({
      ingestNotifications,
      weeklySummary,
      exportNotifications,
    })
  }

  const hasChanges =
    ingestNotifications !== (prefs?.ingestNotifications ?? DEFAULT_PREFERENCES.ingestNotifications) ||
    weeklySummary !== (prefs?.weeklySummary ?? DEFAULT_PREFERENCES.weeklySummary) ||
    exportNotifications !== (prefs?.exportNotifications ?? DEFAULT_PREFERENCES.exportNotifications)

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-accent" />
          Notification preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="pref-ingest" className="text-sm font-medium cursor-pointer">
                Ingestion issue emails
              </Label>
              <p className="text-xs text-muted-foreground">Data pipeline alerts</p>
            </div>
          </div>
          <Switch
            id="pref-ingest"
            checked={ingestNotifications}
            onCheckedChange={setIngestNotifications}
            aria-label="Toggle ingestion notifications"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="pref-weekly" className="text-sm font-medium cursor-pointer">
                Weekly summary
              </Label>
              <p className="text-xs text-muted-foreground">IPI digest</p>
            </div>
          </div>
          <Switch
            id="pref-weekly"
            checked={weeklySummary}
            onCheckedChange={setWeeklySummary}
            aria-label="Toggle weekly summary"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <FileDown className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="pref-export" className="text-sm font-medium cursor-pointer">
                Export completion
              </Label>
              <p className="text-xs text-muted-foreground">When audit export is ready</p>
            </div>
          </div>
          <Switch
            id="pref-export"
            checked={exportNotifications}
            onCheckedChange={setExportNotifications}
            aria-label="Toggle export notifications"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || updatePrefs.isPending}
          className="w-full transition-all duration-200 hover:scale-[1.01]"
        >
          {updatePrefs.isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
