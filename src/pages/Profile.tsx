import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentUser, authKeys } from '@/hooks/useAuth'
import { useSavedCompanies } from '@/hooks/useCompanies'
import { useProfileActivity } from '@/hooks/useProfile'
import { UserProfileLayout } from '@/components/profile'
import { toast } from 'sonner'
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
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = useCurrentUser()
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

  useEffect(() => {
    if (userError) toast.error('Could not load your profile. Try again.')
    if (savedError) toast.error('Could not load saved companies. Try again.')
    if (activityError) toast.error('Could not load recent activity. Try again.')
  }, [userError, savedError, activityError])

  const handleProfileUpdated = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.user })
  }

  const safeSaved = Array.isArray(savedCompanies) ? savedCompanies : []
  const safeActivity = Array.isArray(activity) ? activity : []

  return (
    <UserProfileLayout
      user={user}
      userLoading={userLoading}
      userError={userError}
      refetchUser={refetchUser}
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
