/**
 * Email Notifications & System Alerts - Supabase Edge Function
 * Routes: resend-verification, request-password-reset, reset-password, set-email,
 *         templates, templates-publish, send-test, metrics, queue, logs, opt-out
 * Integrates with Supabase Auth for verification/password reset.
 * Stores audit records in email_messages and email_audit_payloads.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-email-action',
  'Access-Control-Max-Age': '86400',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getAction(req: Request): string {
  return req.headers.get('x-email-action') ?? new URL(req.url).searchParams.get('action') ?? ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const authHeader = req.headers.get('Authorization')

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  })
  const adminClient = serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : null

  const action = getAction(req)
  let body: Record<string, unknown> = {}
  try {
    if (req.method !== 'GET' && req.body) {
      body = (await req.json()) as Record<string, unknown>
    }
  } catch {
    body = {}
  }

  try {
    switch (action) {
      case 'resend-verification': {
        if (!authHeader) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: { user }, error: userError } = await authClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        )
        if (userError || !user) {
          return jsonResponse({ success: false, message: 'Invalid or expired token' }, 401)
        }
        if (user.email_confirmed_at) {
          return jsonResponse({ success: true, message: 'Email already verified' })
        }
        const email = ((body?.email ?? user.email) as string)?.trim()
        if (!email) return jsonResponse({ success: false, message: 'Email required' }, 400)

        const idempotencyKey = `resend-${user.id}-${Date.now()}`
        const messageId = crypto.randomUUID()

        if (adminClient) {
          await adminClient.from('email_messages').insert({
            id: messageId,
            user_id: user.id,
            to: email,
            template_id: 'verification',
            payload: { type: 'signup' },
            status: 'queued',
            idempotency_key: idempotencyKey,
          })
          await adminClient.from('email_audit_payloads').insert({
            email_message_id: messageId,
            raw_payload: { to: email, templateId: 'verification', userId: user.id },
          })
        }

        const { error } = await authClient.auth.resend({ type: 'signup', email })
        if (error) {
          const nextAllowedAt = error.message?.toLowerCase().includes('rate')
            ? new Date(Date.now() + 60000).toISOString()
            : undefined
          return jsonResponse({
            success: false,
            message: error.message ?? 'Failed to resend',
            nextAllowedAt,
          })
        }
        if (adminClient) {
          await adminClient.from('email_messages').update({
            status: 'sent',
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', messageId)
        }
        return jsonResponse({
          success: true,
          message: 'Verification email sent',
          messageId,
          nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
        })
      }

      case 'request-password-reset': {
        const email = (body?.email as string)?.trim()
        if (!email) return jsonResponse({ success: false, message: 'Email required' }, 400)
        const redirectTo = (body?.redirectTo as string) ?? `${req.headers.get('origin') ?? ''}/reset`

        const messageId = crypto.randomUUID()
        if (adminClient) {
          await adminClient.from('email_messages').insert({
            id: messageId,
            to: email,
            template_id: 'passwordReset',
            payload: { redirectTo },
            status: 'queued',
          })
          await adminClient.from('email_audit_payloads').insert({
            email_message_id: messageId,
            raw_payload: { to: email, templateId: 'passwordReset' },
          })
        }

        const { error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo })
        if (error) {
          return jsonResponse({ success: false, message: error.message ?? 'Failed to send' }, 400)
        }
        if (adminClient) {
          await adminClient.from('email_messages').update({
            status: 'sent',
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', messageId)
        }
        return jsonResponse({
          success: true,
          message: 'Password reset email sent',
          messageId,
        })
      }

      case 'reset-password': {
        const token = (body?.token as string)?.trim()
        const newPassword = (body?.newPassword as string)?.trim()
        if (!token || !newPassword) {
          return jsonResponse({ success: false, message: 'Token and newPassword required' }, 400)
        }
        const { data, error } = await authClient.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        })
        if (error) {
          return jsonResponse({
            success: false,
            message: error.message ?? 'Invalid or expired token',
          }, 400)
        }
        const userClient = data?.session
          ? createClient(supabaseUrl, anonKey, {
              global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
            })
          : authClient
        const { error: updateError } = await userClient.auth.updateUser({ password: newPassword })
        if (updateError) {
          return jsonResponse({ success: false, message: updateError.message ?? 'Failed to update password' }, 400)
        }
        return jsonResponse({ success: true, message: 'Password updated' })
      }

      case 'set-email': {
        if (!authHeader) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const newEmail = (body?.newEmail ?? body?.new_email as string)?.trim()
        if (!newEmail) return jsonResponse({ success: false, message: 'New email required' }, 400)
        const { data: { user }, error: userError } = await authClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        )
        if (userError || !user) {
          return jsonResponse({ success: false, message: 'Invalid or expired token' }, 401)
        }
        const { error } = await authClient.auth.updateUser({ email: newEmail })
        if (error) {
          return jsonResponse({ success: false, message: error.message ?? 'Failed to update email' }, 400)
        }
        return jsonResponse({ success: true, message: 'Verification email sent to new address' })
      }

      case 'templates': {
        if (!adminClient) return jsonResponse({ templates: [] })
        if (authHeader) {
          const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
          if (user) {
            const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
          }
        }
        const { data, error } = await adminClient
          .from('email_templates')
          .select('id, name, subject, version, last_updated_at, active')
          .order('name')
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ templates: data ?? [] })
      }

      case 'templates-publish': {
        if (!adminClient || !authHeader) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
        if (!user) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
        const id = (body?.id ?? body?.templateId) as string
        if (!id) return jsonResponse({ success: false, message: 'Template id required' }, 400)
        const { subject, bodyHtml, bodyText } = body
        const updates: Record<string, unknown> = { last_updated_at: new Date().toISOString() }
        if (typeof subject === 'string') updates.subject = subject
        if (typeof bodyHtml === 'string') updates.body_html = bodyHtml
        if (typeof bodyText === 'string') updates.body_text = bodyText
        const { data: t } = await adminClient.from('email_templates').select('version').eq('id', id).single()
        if (t) updates.version = ((t.version as number) ?? 1) + 1
        const { error } = await adminClient.from('email_templates').update(updates).eq('id', id)
        if (error) return jsonResponse({ success: false, message: error.message }, 500)
        return jsonResponse({ success: true, message: 'Template updated' })
      }

      case 'send-test': {
        if (!adminClient || !authHeader) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
        if (!user) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
        const templateId = (body?.templateId ?? body?.template_id) as string
        const to = (body?.to ?? body?.email) as string
        if (!templateId || !to) {
          return jsonResponse({ success: false, message: 'templateId and to required' }, 400)
        }
        const messageId = crypto.randomUUID()
        await adminClient.from('email_messages').insert({
          id: messageId,
          to,
          template_id: templateId,
          payload: { test: true },
          status: 'sent',
          last_attempt_at: new Date().toISOString(),
        })
        await adminClient.from('email_audit_payloads').insert({
          email_message_id: messageId,
          raw_payload: { to, templateId, test: true },
        })
        return jsonResponse({ success: true, messageId, message: 'Test email queued (no provider configured)' })
      }

      case 'metrics': {
        if (!adminClient) return jsonResponse({ metrics: { delivered: 0, sent: 0, bounced: 0, failed: 0, queued: 0, openRate: 0 }, timeSeries: [] })
        if (authHeader) {
          const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
          if (user) {
            const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
          }
        }
        const { data: messages } = await adminClient
          .from('email_messages')
          .select('status, template_id, created_at')
        const list = (messages ?? []) as Array<{ status: string; template_id: string; created_at: string }>
        const delivered = list.filter((m) => m.status === 'delivered').length
        const sent = list.filter((m) => m.status === 'sent').length
        const bounced = list.filter((m) => m.status === 'bounced').length
        const failed = list.filter((m) => m.status === 'failed').length
        const queued = list.filter((m) => m.status === 'queued').length
        const timeSeries = list.slice(-100).map((m) => ({
          date: m.created_at,
          status: m.status,
          templateId: m.template_id,
        }))
        return jsonResponse({
          metrics: {
            delivered,
            sent,
            bounced,
            failed,
            queued,
            openRate: delivered > 0 ? Math.round((delivered / (delivered + bounced + failed)) * 100) : 0,
          },
          timeSeries,
        })
      }

      case 'queue': {
        if (!adminClient) return jsonResponse({ items: [] })
        if (authHeader) {
          const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
          if (user) {
            const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
          }
        }
        const { data } = await adminClient
          .from('email_messages')
          .select('id, to, template_id, status, retry_count, last_attempt_at, next_retry_at, created_at')
          .in('status', ['queued', 'sent'])
          .order('created_at', { ascending: false })
          .limit(50)
        return jsonResponse({ items: data ?? [] })
      }

      case 'logs': {
        if (!adminClient) return jsonResponse({ logs: [], count: 0, page: 1, limit: 20 })
        if (authHeader) {
          const { data: { user } } = await authClient.auth.getUser(authHeader.replace('Bearer ', ''))
          if (user) {
            const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin required' }, 403)
          }
        }
        const page = Math.max(1, Number(body?.page ?? 1))
        const limit = Math.min(100, Math.max(1, Number(body?.limit ?? 20)))
        const offset = (page - 1) * limit
        const templateId = body?.templateId as string | undefined
        const from = body?.from as string | undefined
        const to = body?.to as string | undefined

        let q = adminClient
          .from('email_messages')
          .select('id, to, template_id, status, created_at, user_id', { count: 'exact' })
        if (templateId) q = q.eq('template_id', templateId)
        if (from) q = q.gte('created_at', from)
        if (to) q = q.lte('created_at', to)
        const { data: messages, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
        if (error) return jsonResponse({ error: error.message }, 500)
        const list = (messages ?? []) as Array<{ id: string; to: string; template_id: string; status: string; created_at: string; user_id?: string }>
        const ids = list.map((m) => m.id)
        let payloadMap = new Map<string, { raw_payload: unknown; received_at: string }>()
        if (ids.length > 0) {
          try {
            const { data: payloads } = await adminClient
              .from('email_audit_payloads')
              .select('email_message_id, raw_payload, received_at')
              .in('email_message_id', ids)
            const arr = (payloads ?? []) as Array<{ email_message_id: string; raw_payload: unknown; received_at: string }>
            for (const p of arr) {
              payloadMap.set(p.email_message_id, { raw_payload: p.raw_payload, received_at: p.received_at })
            }
          } catch {
            // email_audit_payloads may not exist in some migrations
          }
        }
        const logs = list.map((m) => {
          const audit = payloadMap.get(m.id)
          return {
            id: m.id,
            to: m.to,
            template_id: m.template_id,
            status: m.status,
            created_at: m.created_at,
            user_id: m.user_id,
            rawPayload: audit?.raw_payload,
            receivedAt: audit?.received_at,
          }
        })
        return jsonResponse({ logs, count: count ?? 0, page, limit })
      }

      case 'opt-out': {
        if (!authHeader || !adminClient) return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
        const { data: { user }, error: userError } = await authClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        )
        if (userError || !user) {
          return jsonResponse({ success: false, message: 'Invalid or expired token' }, 401)
        }
        const templateId = (body?.templateId ?? body?.template_id) as string | undefined
        const optIn = body?.optIn ?? false
        const { data: prefs } = await adminClient
          .from('user_email_preferences')
          .select('opt_in_emails')
          .eq('user_id', user.id)
          .single()
        const current = (prefs?.opt_in_emails as Record<string, boolean>) ?? {}
        const next = templateId
          ? { ...current, [templateId]: !!optIn }
          : Object.fromEntries(Object.keys(current).map((k) => [k, false]))
        await adminClient.from('user_email_preferences').upsert({
          user_id: user.id,
          opt_in_emails: next,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        return jsonResponse({ success: true, message: 'Preferences updated' })
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action || '(none)'}` }, 400)
    }
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    )
  }
})
