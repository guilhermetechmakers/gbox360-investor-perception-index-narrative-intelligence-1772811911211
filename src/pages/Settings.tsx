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
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings & preferences</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, notifications, IPI weights, and account.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto flex-wrap gap-2 p-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="weights" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            IPI weights
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Shield className="h-4 w-4" />
            Data & privacy
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
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
    </div>
  )
}
