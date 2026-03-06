/**
 * Email Notifications & System Alerts API
 * Integrates with Supabase Edge Functions (email-templates, email-metrics, etc.)
 */
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type {
  EmailTemplate,
  EmailMetricsResponse,
  EmailQueueItem,
  EmailLogItem,
} from '@/types/email'

const ACTION_MAP: Record<string, string> = {
  templates: 'templates',
  'templates-publish': 'templates-publish',
  'send-test': 'send-test',
  'set-email': 'set-email',
  metrics: 'metrics',
  queue: 'queue',
  logs: 'logs',
  'opt-out': 'opt-out',
}

async function invokeEmailFunction<T>(
  key: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (supabase) {
    const action = ACTION_MAP[key] ?? key
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null)
    const headers: Record<string, string> = { 'x-email-action': action }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await supabase.functions.invoke('email', {
      body: body ?? {},
      headers,
    })
    if (res.error) throw new Error(res.error.message ?? 'Email API error')
    return (res.data ?? {}) as T
  }
  const path = key.replace(/-/g, '/')
  if (body && Object.keys(body).length > 0) {
    if (key === 'logs') {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== '') qs.set(k, String(v))
      }
      const suffix = qs.toString() ? `?${qs.toString()}` : ''
      return api.get<T>(`/email/${path}${suffix}`) ?? ({} as T)
    }
    return api.post<T>(`/email/${path}`, body) ?? ({} as T)
  }
  return api.get<T>(`/email/${path}`) ?? ({} as T)
}

export const emailApi = {
  resendVerification: async (email: string): Promise<{ success: boolean; messageId?: string }> => {
    if (supabase) {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      return { success: true }
    }
    const res = await api.post<{ success: boolean; messageId?: string }>(
      '/email/resend-verification',
      { email }
    )
    return { success: res?.success ?? false, messageId: res?.messageId }
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; messageId?: string }> => {
    if (supabase) {
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/reset`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      return { success: true }
    }
    const res = await api.post<{ success: boolean; messageId?: string }>(
      '/email/request-password-reset',
      { email }
    )
    return { success: res?.success ?? false, messageId: res?.messageId }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean }> => {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return { success: true }
    }
    const res = await api.post<{ success: boolean }>('/email/reset-password', {
      token,
      newPassword,
    })
    return { success: res?.success ?? false }
  },

  setEmail: async (newEmail: string, _userId?: string): Promise<{ success: boolean; message?: string }> => {
    if (supabase) {
      try {
        const res = await invokeEmailFunction<{ success: boolean; message?: string }>('set-email', { newEmail })
        return res ?? { success: true }
      } catch {
        const { error } = await supabase.auth.updateUser({ email: newEmail })
        if (error) throw error
        return { success: true, message: 'Verification email sent to new address' }
      }
    }
    const res = await api.post<{ success: boolean }>('/email/set-email', { newEmail })
    return { success: res?.success ?? false }
  },

  getTemplates: async (): Promise<EmailTemplate[]> => {
    try {
      const res = await invokeEmailFunction<{ templates?: EmailTemplate[] } | EmailTemplate[]>(
        'templates',
        {}
      )
      const list = Array.isArray(res) ? res : (res?.templates ?? (res as { data?: EmailTemplate[] })?.data ?? [])
      return list ?? []
    } catch {
      return []
    }
  },

  publishTemplate: async (
    id: string,
    payload: { subject?: string; bodyHtml?: string; bodyText?: string }
  ): Promise<EmailTemplate> => {
    const res = await invokeEmailFunction<EmailTemplate | { data?: EmailTemplate }>(
      'templates-publish',
      { id, ...payload }
    )
    return (res && 'id' in res ? res : (res as { data?: EmailTemplate })?.data) as EmailTemplate
  },

  sendTestEmail: async (
    templateId: string,
    to: string
  ): Promise<{ success: boolean; messageId?: string }> => {
    return invokeEmailFunction('send-test', { templateId, to })
  },

  getMetrics: async (): Promise<EmailMetricsResponse> => {
    try {
      const res = await invokeEmailFunction<EmailMetricsResponse & { metrics?: Record<string, number> }>('metrics', {})
      return (
        res ?? {
          metrics: { delivered: 0, sent: 0, bounced: 0, failed: 0, queued: 0, openRate: 0 },
          deliveries: 0,
          opens: 0,
          bounces: 0,
          failures: 0,
          retries: 0,
          timeSeries: [],
        }
      ) as EmailMetricsResponse
    } catch {
      return {
        deliveries: 0,
        opens: 0,
        bounces: 0,
        failures: 0,
        retries: 0,
        timeSeries: [],
      }
    }
  },

  getQueue: async (): Promise<EmailQueueItem[]> => {
    try {
      const res = await invokeEmailFunction<{ items?: EmailQueueItem[] } | EmailQueueItem[]>(
        'queue',
        {}
      )
      const list = Array.isArray(res) ? res : (res?.items ?? (res as { data?: EmailQueueItem[] })?.data ?? [])
      return list ?? []
    } catch {
      return []
    }
  },

  getLogs: async (params?: {
    from?: string
    to?: string
    templateId?: string
    userId?: string
    page?: number
    limit?: number
  }): Promise<{ data: EmailLogItem[]; count: number }> => {
    try {
      const res = await invokeEmailFunction<
        | { logs: EmailLogItem[]; count: number }
        | { data: EmailLogItem[]; count: number }
        | EmailLogItem[]
      >('logs', params as Record<string, unknown>)
      if (Array.isArray(res)) {
        return { data: res ?? [], count: (res ?? []).length }
      }
      const out = res as { logs?: EmailLogItem[]; data?: EmailLogItem[]; count?: number }
      const list = out?.logs ?? out?.data ?? []
      return { data: list, count: out?.count ?? list.length }
    } catch {
      return { data: [], count: 0 }
    }
  },

  optOut: async (userId: string, templateId?: string): Promise<{ success: boolean }> => {
    return invokeEmailFunction('opt-out', { userId, templateId })
  },
}
