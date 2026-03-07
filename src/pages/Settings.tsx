import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ProfileEditor,
  NotificationPreferencesPanel,
  ProvisionalWeightPanel,
  DataExportPanel,
  AccountControlsPanel,
  APIKeysPanel,
} from '@/components/settings'
import { User, Bell, BarChart3, Shield, Key } from 'lucide-react'

export function Settings() {
  return (
    <main className="space-y-6 animate-fade-in-up" aria-label="Settings and preferences">
      <header>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Settings & preferences
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, notifications, IPI weights, and account.
        </p>
      </header>

      <section
        className="space-y-6"
        aria-labelledby="settings-sections-heading"
        role="region"
      >
        <h2
          id="settings-sections-heading"
          className="text-lg font-medium text-muted-foreground"
        >
          Settings sections
        </h2>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 flex-wrap gap-2 p-2 lg:grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" aria-hidden />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" aria-hidden />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="weights" className="gap-2">
              <BarChart3 className="h-4 w-4" aria-hidden />
              IPI weights
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Shield className="h-4 w-4" aria-hidden />
              Data & privacy
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="h-4 w-4" aria-hidden />
              API keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileEditor />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationPreferencesPanel />
          </TabsContent>

          <TabsContent value="weights" className="mt-6">
            <ProvisionalWeightPanel />
          </TabsContent>

          <TabsContent value="data" className="mt-6 space-y-6">
            <DataExportPanel />
            <AccountControlsPanel />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <APIKeysPanel />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}
