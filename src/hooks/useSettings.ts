import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/settings'
import { authKeys } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { UserProfile, UserPreferences } from '@/types/settings'
import { DEFAULT_PREFERENCES, DEFAULT_WEIGHTS } from '@/types/settings'

export const settingsKeys = {
  profile: ['settings', 'profile'] as const,
  preferences: ['settings', 'preferences'] as const,
  weights: ['settings', 'weights'] as const,
}

export function useSettingsProfile() {
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: () => settingsApi.getProfile(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateSettingsProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<Pick<UserProfile, 'name' | 'organization' | 'role'>>) =>
      settingsApi.updateProfile(updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(settingsKeys.profile, data)
        queryClient.setQueryData(authKeys.user, (prev: unknown) =>
          prev && typeof prev === 'object' && data
            ? { ...(prev as object), full_name: data.name, org: data.organization, role: data.role }
            : prev
        )
      }
      toast.success('Profile updated')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  })
}

export function useSettingsPreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences,
    queryFn: () => settingsApi.getPreferences(),
    staleTime: 1000 * 60 * 5,
    placeholderData: null,
  })
}

export function useUpdateSettingsPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (prefs: Partial<Omit<UserPreferences, 'userId'>>) =>
      settingsApi.updatePreferences(prefs),
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(settingsKeys.preferences, data)
      toast.success('Preferences saved')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  })
}

export function useSettingsWeights() {
  return useQuery({
    queryKey: settingsKeys.weights,
    queryFn: () => settingsApi.getWeights(),
    staleTime: 1000 * 60 * 5,
    placeholderData: null,
  })
}

export function useUpdateSettingsWeights() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (weights: { narrative: number; credibility: number; risk: number }) =>
      settingsApi.updateWeights(weights),
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(settingsKeys.weights, data)
      toast.success('Weights saved')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  })
}

export function useDataExport() {
  return useMutation({
    mutationFn: (format: 'csv' | 'json') => settingsApi.triggerExport(format),
    onSuccess: (blob, format) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gbox360-export.${format}`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export downloaded')
      } else {
        toast.error('Export failed. Try again or use CSV from User Management.')
      }
    },
    onError: () => toast.error('Export failed'),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => settingsApi.deleteAccount(),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.clear()
        if (typeof localStorage !== 'undefined') localStorage.removeItem('auth_token')
        window.location.href = '/'
        toast.success('Account deleted')
      } else {
        toast.error('Account deletion failed')
      }
    },
    onError: () => toast.error('Account deletion failed'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      settingsApi.changePassword(currentPassword, newPassword),
    onSuccess: (ok) => {
      if (ok) toast.success('Password updated')
      else toast.error('Password update failed')
    },
    onError: () => toast.error('Password update failed'),
  })
}

/** Resolve effective preferences with defaults */
export function useEffectivePreferences(): UserPreferences | null {
  const { data } = useSettingsPreferences()
  if (!data) return null
  return {
    userId: data.userId,
    ingestNotifications: data.ingestNotifications ?? DEFAULT_PREFERENCES.ingestNotifications,
    weeklySummary: data.weeklySummary ?? DEFAULT_PREFERENCES.weeklySummary,
    exportNotifications: data.exportNotifications ?? DEFAULT_PREFERENCES.exportNotifications,
  }
}

/** Resolve effective weights with defaults */
export function useEffectiveWeights(): { narrative: number; credibility: number; risk: number } {
  const { data } = useSettingsWeights()
  if (!data) return DEFAULT_WEIGHTS
  return {
    narrative: data.narrative ?? DEFAULT_WEIGHTS.narrative,
    credibility: data.credibility ?? DEFAULT_WEIGHTS.credibility,
    risk: data.risk ?? DEFAULT_WEIGHTS.risk,
  }
}
