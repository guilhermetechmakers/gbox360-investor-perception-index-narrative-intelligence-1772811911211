import { UserInfoCard } from './UserInfoCard'
import { SavedCompaniesPanel } from './SavedCompaniesPanel'
import { RecentActivityList } from './RecentActivityList'
import { PreferencesPanel } from './PreferencesPanel'
import { WeightScenariosPreviewCard } from './WeightScenariosPreviewCard'
import { AccountActionsPanel } from './AccountActionsPanel'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/user'
import type { Company } from '@/types/company'
import type { ProfileActivityItem } from '@/types/profile'
import type { UserPreferences } from '@/types/settings'

export interface UserProfileLayoutProps {
  user: User | null | undefined
  userLoading?: boolean
  userError?: boolean
  refetchUser?: () => void
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
  userError = false,
  refetchUser,
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
    <main
      className="space-y-12 animate-fade-in-up md:space-y-16"
      aria-labelledby="profile-page-title"
      role="main"
    >
      <Card className="rounded-[10px] border-[rgb(var(--border))] bg-card shadow-card transition-shadow duration-200">
        <CardHeader className="pb-2">
          <CardTitle id="profile-page-title" className="text-2xl font-semibold md:text-3xl">
            Profile
          </CardTitle>
          <CardDescription>
            Your personal overview, saved companies, and account settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <section aria-label="User profile information">
        <UserInfoCard
          user={user}
          isLoading={userLoading}
          isError={userError}
          onRetry={refetchUser}
          onProfileUpdated={onProfileUpdated}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-6 lg:space-y-8">
          <section aria-label="Saved companies">
            <SavedCompaniesPanel
              savedCompanies={savedCompanies ?? []}
              isLoading={savedLoading}
              isError={savedError}
              onRetry={refetchSaved}
              timeWindow={timeWindow}
            />
          </section>
          <section aria-label="Recent activity">
            <RecentActivityList
              activity={activity ?? []}
              isLoading={activityLoading}
              isError={activityError}
              onRetry={refetchActivity}
            />
          </section>
        </div>
        <div className="space-y-6 lg:col-span-6 lg:space-y-8">
          <WeightScenariosPreviewCard />
          <PreferencesPanel />
          <AccountActionsPanel />
        </div>
      </div>
    </main>
  )
}
