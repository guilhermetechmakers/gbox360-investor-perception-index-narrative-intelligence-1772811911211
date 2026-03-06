/**
 * Email logs - Supabase Edge Function
 * GET: Raw payload logs for audit (paged, filtered) (admin only)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined
    const templateId = url.searchParams.get('templateId') ?? undefined
    const userId = url.searchParams.get('userId') ?? undefined
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
    const offset = (page - 1) * limit

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = supabase
      .from('email_messages')
      .select('id, to, template_id, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (templateId) query = query.eq('template_id', templateId)
    if (userId) query = query.eq('user_id', userId)

    const { data: messages, count, error } = await query

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ids = (messages ?? []).map((m) => m.id)
    const { data: payloads } = await supabase
      .from('email_audit_payloads')
      .select('email_message_id, raw_payload, received_at')
      .in('email_message_id', ids)

    const payloadMap = new Map(
      (payloads ?? []).map((p) => [p.email_message_id, p])
    )

    const logs = (messages ?? []).map((row) => {
      const audit = payloadMap.get(row.id)
      return {
        id: row.id,
        emailMessageId: row.id,
        to: row.to,
        templateId: row.template_id,
        status: row.status,
        rawPayload: audit?.raw_payload,
        receivedAt: audit?.received_at ?? row.created_at,
      }
    })

    return new Response(
      JSON.stringify({ data: logs, count: count ?? logs.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
