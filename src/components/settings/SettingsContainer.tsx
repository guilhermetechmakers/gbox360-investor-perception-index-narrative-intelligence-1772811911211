import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileEditor } from './ProfileEditor'
import { NotificationPreferencesPanel } from './NotificationPreferencesPanel'
import { ProvisionalWeightPanel } from './ProvisionalWeightPanel'
import { AccountControlsPanel } from './AccountControlsPanel'
import { APIKeysPanel } from './APIKeysPanel'
import { User, Bell, BarChart3, Shield, Key } from 'lucide-react'

const SECTIONS = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'weights', label: 'IPI weights', icon: BarChart3 },
  { value: 'data', label: 'Data & privacy', icon: Shield },
  { value: 'api', label: 'API keys', icon: Key },
] as const

export function SettingsContainer() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings & preferences</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, notifications, provisional weights, and account controls.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/50 p-1">
          {(SECTIONS ?? []).map((section) => {
            const Icon = section.icon
            return (
              <TabsTrigger
                key={section.value}
                value={section.value}
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
            )
          })}
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

        <TabsContent value="data" className="mt-6">
          <AccountControlsPanel />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <APIKeysPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
