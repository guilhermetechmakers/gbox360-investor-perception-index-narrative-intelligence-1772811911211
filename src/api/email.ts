/**
 * Email Notifications API
 * Calls Supabase Edge Function "email" with action header.
 */
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type {
  EmailTemplate,
  EmailMetricsResponse,
  EmailLogEntry,
} from '@/types/email'

const supabaseUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL as string) ?? '' : ''
const supabaseAnonKey = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ?? '' : ''
const FUNCTIONS_BASE = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : ''

async function emailAction<T>(
  action: string,
  options: { method?: string; body?: Record<string, unknown> }
): Promise<T> {
  if (supabase && FUNCTIONS_BASE) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-email-action': action,
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${FUNCTIONS_BASE}/email`, {
      method: options.method ?? 'POST',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const json = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) {
      throw new Error(json?.error ?? `Request failed: ${res.status}`)
    }
    return json as T
  }
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000/api'
  const endpoint = `${base}/email/${action.replace(/-/g, '/')}`
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(endpoint, {
    method: options.method ?? 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const json = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error(json?.error ?? `Request failed: ${res.status}`)
  }
  return json as T
}

export const emailApi = {
  resendVerification: (email: string) =>
    emailAction<{ success: boolean; message: string; messageId?: string; nextAllowedAt?: string }>(
      'resend-verification',
      { body: { email } }
    ),

  requestPasswordReset: (email: string, redirectTo?: string) =>
    emailAction<{ success: boolean; message: string; messageId?: string }>(
      'request-password-reset',
      { body: { email, redirectTo } }
    ),

  resetPassword: (token: string, newPassword: string) =>
    emailAction<{ success: boolean; message: string }>(
      'reset-password',
      { body: { token, newPassword } }
    ),

  setEmail: (newEmail: string) =>
    emailAction<{ success: boolean; message: string }>(
      'set-email',
      { body: { newEmail } }
    ),

  getTemplates: () =>
    emailAction<{ templates: EmailTemplate[] }>('templates', { method: 'POST', body: {} }),

  publishTemplate: (id: string, updates: { subject?: string; bodyHtml?: string; bodyText?: string }) =>
    emailAction<{ success: boolean; message: string }>(
      'templates-publish',
      { body: { id, ...updates } }
    ),

  sendTest: (templateId: string, to: string) =>
    emailAction<{ success: boolean; messageId?: string; message?: string }>(
      'send-test',
      { body: { templateId, to } }
    ),

  getMetrics: () =>
    emailAction<EmailMetricsResponse>('metrics', { method: 'POST', body: {} }),

  getQueue: () =>
    emailAction<{ items: Array<Record<string, unknown>> }>('queue', { method: 'POST', body: {} }),

  getLogs: (params?: { page?: number; limit?: number; templateId?: string; from?: string; to?: string }) =>
    emailAction<{ logs: EmailLogEntry[]; count: number; page: number; limit: number }>(
      'logs',
      { body: params ?? {} }
    ),

  optOut: (templateId?: string, optIn = false) =>
    emailAction<{ success: boolean; message: string }>(
      'opt-out',
      { body: { templateId, optIn } }
    ),
}
