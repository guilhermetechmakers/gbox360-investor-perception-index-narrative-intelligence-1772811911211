import { UserInfoCard } from './UserInfoCard'
import { SavedCompaniesPanel } from './SavedCompaniesPanel'
import { RecentActivityList } from './RecentActivityList'
import { PreferencesPanel } from './PreferencesPanel'
import { WeightScenariosPreviewCard } from './WeightScenariosPreviewCard'
import { AccountActionsPanel } from './AccountActionsPanel'
import type { User } from '@/types/user'
import type { Company } from '@/types/company'
import type { ProfileActivityItem } from '@/types/profile'
import type { UserPreferences } from '@/types/settings'

export interface UserProfileLayoutProps {
  user: User | null | undefined
  userLoading?: boolean
  savedCompanies: Company[]
  savedLoading?: boolean
  savedError?: boolean
  refetchSaved?: () => void
  activity: ProfileActivityItem[]
  activityLoading?: boolean
  activityError?: boolean
  refetchActivity?: () => void
  preferences?: UserPreferences | null
  timeWindow?: { start: string; end: string }
  onProfileUpdated?: () => void
}

export function UserProfileLayout({
  user,
  userLoading = false,
  savedCompanies,
  savedLoading = false,
  savedError = false,
  refetchSaved,
  activity,
  activityLoading = false,
  activityError = false,
  refetchActivity,
  timeWindow,
  onProfileUpdated,
}: UserProfileLayoutProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your personal overview, saved companies, and account settings.
        </p>
      </div>

      <UserInfoCard
        user={user}
        isLoading={userLoading}
        onProfileUpdated={onProfileUpdated}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 space-y-6">
          <SavedCompaniesPanel
            savedCompanies={savedCompanies ?? []}
            isLoading={savedLoading}
            isError={savedError}
            onRetry={refetchSaved}
            timeWindow={timeWindow}
          />
          <RecentActivityList
            activity={activity ?? []}
            isLoading={activityLoading}
            isError={activityError}
            onRetry={refetchActivity}
          />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <WeightScenariosPreviewCard />
          <PreferencesPanel />
          <AccountActionsPanel />
        </div>
      </div>
    </div>
  )
}
