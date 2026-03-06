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
  const { data: savedCompanies = [], isLoading: savedLoading } = useSavedCompanies()
  const { data: activity = [], isLoading: activityLoading } = useProfileActivity(20)
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
      activity={safeActivity}
      activityLoading={activityLoading}
      timeWindow={timeWindow}
      onProfileUpdated={handleProfileUpdated}
    />
  )
}
