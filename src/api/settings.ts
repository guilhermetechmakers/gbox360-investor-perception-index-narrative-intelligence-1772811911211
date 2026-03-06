import { api } from '@/lib/api'
import { usersApi } from '@/api/users'
import type {
  UserProfile,
  UserPreferences,
  ProvisionalWeights,
} from '@/types/settings'

/** Settings API - uses /api/settings/* and /users/* endpoints */
export const settingsApi = {
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const user = await usersApi.getCurrent()
      if (!user) return null
      return {
        id: user.id,
        name: user.full_name ?? '',
        email: user.email ?? '',
        organization: user.org,
        role: user.role,
        twoFactorEnabled: false,
      }
    } catch {
      return null
    }
  },

  updateProfile: async (updates: Partial<Pick<UserProfile, 'name' | 'organization' | 'role'>>): Promise<UserProfile | null> => {
    try {
      const user = await usersApi.getCurrent()
      if (!user?.id) return null
      const updated = await usersApi.updateProfile({
        id: user.id,
        full_name: updates.name,
        org: updates.organization,
        role: updates.role as 'user' | 'admin' | 'operator' | 'auditor' | undefined,
      })
      if (!updated) return null
      return {
        id: updated.id,
        name: updated.full_name ?? '',
        email: updated.email ?? '',
        organization: updated.org,
        role: updated.role,
        twoFactorEnabled: false,
      }
    } catch {
      return null
    }
  },

  getPreferences: async (): Promise<UserPreferences | null> => {
    try {
      const user = await usersApi.getCurrent()
      const res = await api.get<UserPreferences | null>('/settings/preferences')
      const data = res ?? null
      if (data && user) return { ...data, userId: user.id }
      if (user) {
        return {
          userId: user.id,
          ingestNotifications: true,
          weeklySummary: false,
          exportNotifications: true,
        }
      }
      return null
    } catch {
      try {
        const user = await usersApi.getCurrent()
        if (user)
          return {
            userId: user.id,
            ingestNotifications: true,
            weeklySummary: false,
            exportNotifications: true,
          }
      } catch {
        /* ignore */
      }
      return null
    }
  },

  updatePreferences: async (prefs: Partial<Omit<UserPreferences, 'userId'>>): Promise<UserPreferences | null> => {
    try {
      const res = await api.put<UserPreferences>('/settings/preferences', prefs)
      return res ?? null
    } catch {
      const user = await usersApi.getCurrent()
      if (user)
        return {
          userId: user.id,
          ingestNotifications: prefs.ingestNotifications ?? true,
          weeklySummary: prefs.weeklySummary ?? false,
          exportNotifications: prefs.exportNotifications ?? true,
        }
      return null
    }
  },

  getWeights: async (): Promise<ProvisionalWeights | null> => {
    try {
      const user = await usersApi.getCurrent()
      const res = await api.get<ProvisionalWeights | null>('/settings/weights')
      const data = res ?? null
      if (data && user) return { ...data, userId: user.id }
      if (user)
        return {
          userId: user.id,
          scenarioName: 'default',
          narrative: 40,
          credibility: 40,
          risk: 20,
          isCustom: false,
        }
      return null
    } catch {
      try {
        const user = await usersApi.getCurrent()
        if (user)
          return {
            userId: user.id,
            scenarioName: 'default',
            narrative: 40,
            credibility: 40,
            risk: 20,
            isCustom: false,
          }
      } catch {
        /* ignore */
      }
      return null
    }
  },

  updateWeights: async (weights: { narrative: number; credibility: number; risk: number }): Promise<ProvisionalWeights | null> => {
    try {
      const user = await usersApi.getCurrent()
      const res = await api.put<ProvisionalWeights>('/settings/weights', weights)
      const data = res ?? null
      if (data && user) return { ...data, userId: user.id }
      if (user)
        return {
          userId: user.id,
          scenarioName: 'custom',
          narrative: weights.narrative,
          credibility: weights.credibility,
          risk: weights.risk,
          isCustom: true,
          updatedAt: new Date().toISOString(),
        }
      return null
    } catch {
      const user = await usersApi.getCurrent()
      if (user)
        return {
          userId: user.id,
          scenarioName: 'custom',
          narrative: weights.narrative,
          credibility: weights.credibility,
          risk: weights.risk,
          isCustom: true,
          updatedAt: new Date().toISOString(),
        }
      return null
    }
  },

  triggerExport: async (format: 'csv' | 'json'): Promise<Blob | null> => {
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      'http://localhost:3000/api'
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
    try {
      const res = await fetch(`${base}/settings/export?format=${format}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) return res.blob()
      if (res.status === 404) {
        const csvRes = await fetch(`${base}/users/export/csv`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (csvRes.ok && format === 'csv') return csvRes.blob()
      }
      return null
    } catch {
      return null
    }
  },

  deleteAccount: async (confirmation?: string): Promise<boolean> => {
    try {
      await api.post('/settings/delete', { confirmation: confirmation ?? 'DELETE' })
      return true
    } catch {
      return false
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      return true
    } catch {
      return false
    }
  },
}
