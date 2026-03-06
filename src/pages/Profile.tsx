import { useQueryClient } from '@tanstack/react-query'
import { useCurrentUser, authKeys } from '@/hooks/useAuth'
import { useSavedCompanies } from '@/hooks/useCompanies'
import { useProfileActivity } from '@/hooks/useProfile'
import { UserProfileLayout } from '@/components/profile'
import { subDays, format } from 'date-fns'

function getDefaultTimeWindow() {
  const end = new Date()
  const start = subDays(end, 7)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function Profile() {
  const queryClient = useQueryClient()
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const {
    data: savedCompanies = [],
    isLoading: savedLoading,
    isError: savedError,
    refetch: refetchSaved,
  } = useSavedCompanies()
  const {
    data: activity = [],
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useProfileActivity(20)
  const timeWindow = getDefaultTimeWindow()

  const handleProfileUpdated = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.user })
  }

  const safeSaved = Array.isArray(savedCompanies) ? savedCompanies : []
  const safeActivity = Array.isArray(activity) ? activity : []

  return (
    <UserProfileLayout
      user={user}
      userLoading={userLoading}
      savedCompanies={safeSaved}
      savedLoading={savedLoading}
      savedError={savedError}
      refetchSaved={refetchSaved}
      activity={safeActivity}
      activityLoading={activityLoading}
      activityError={activityError}
      refetchActivity={refetchActivity}
      timeWindow={timeWindow}
      onProfileUpdated={handleProfileUpdated}
    />
  )
}
