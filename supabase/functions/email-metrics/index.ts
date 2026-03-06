/**
 * Email metrics - Supabase Edge Function
 * GET: Delivery metrics (deliveries, opens, bounces, failures, retries)
 * Admin only.
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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: messages } = await supabase
      .from('email_messages')
      .select('status, retry_count')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const list = messages ?? []
    const deliveries = list.filter((m) => m.status === 'delivered' || m.status === 'sent').length
    const bounces = list.filter((m) => m.status === 'bounced').length
    const failures = list.filter((m) => m.status === 'failed').length
    const retries = list.reduce((acc, m) => acc + (m.retry_count ?? 0), 0)

    const { data: stats } = await supabase
      .from('email_delivery_stats')
      .select('delivered, opened, bounced, failed, suppressed')
      .gte('window_start', thirtyDaysAgo.toISOString())

    const statsList = stats ?? []
    const totalDelivered = statsList.reduce((a, s) => a + (s.delivered ?? 0), 0)
    const totalOpened = statsList.reduce((a, s) => a + (s.opened ?? 0), 0)
    const totalBounced = statsList.reduce((a, s) => a + (s.bounced ?? 0), 0)
    const totalFailed = statsList.reduce((a, s) => a + (s.failed ?? 0), 0)

    const response = {
      deliveries: totalDelivered || deliveries,
      opens: totalOpened,
      bounces: totalBounced || bounces,
      failures: totalFailed || failures,
      retries,
      timeSeries: [] as Array<{
        date: string
        delivered: number
        opened: number
        bounced: number
        failed: number
      }>,
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
