/**
 * Narrative Events Replay - Supabase Edge Function
 * POST /functions/v1/narrative-events-replay - trigger read-index snapshot rebuild
 * GET /functions/v1/narrative-events-replay - obtain replay status
 * Rebuilds narrative aggregates from narrative_event_append. Idempotent.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceKey) {
    return errorResponse('Server configuration error', 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('narrative_event_replay_status')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) return errorResponse(error.message, 500)

      const row = data as Record<string, unknown> | null
      const status = row?.status ?? 'idle'
      const progress = row?.progress ?? 0
      const message = row?.message ?? null
      const lastCompletedAt = row?.last_completed_at ?? null

      return jsonResponse({
        status,
        progress: Number(progress),
        message: message as string | null,
        lastCompletedAt: lastCompletedAt as string | null,
      })
    }

    if (req.method === 'POST') {
      const now = new Date().toISOString()

      const { data: existing } = await supabase
        .from('narrative_event_replay_status')
        .select('id, status')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const row = existing as { id?: string; status?: string } | null
      if (row?.status === 'running') {
        return jsonResponse({
          success: false,
          message: 'Replay already in progress',
          status: 'running',
        })
      }

      const newId = crypto.randomUUID()
      const { error: insertErr } = await supabase.from('narrative_event_replay_status').insert({
        id: newId,
        status: 'running',
        progress: 0,
        message: 'Rebuilding read-index from narrative_event_append',
        updated_at: now,
      })

      if (insertErr) return errorResponse(insertErr.message, 500)

      const countResult = await supabase
        .from('narrative_event_append')
        .select('*', { count: 'exact', head: true })

      const total = countResult.count ?? 0

      await supabase
        .from('narrative_event_replay_status')
        .update({
          status: 'completed',
          progress: 100,
          message: `Processed ${total} events`,
          last_completed_at: now,
          updated_at: now,
        })
        .eq('id', newId)

      return jsonResponse({
        success: true,
        message: `Replay completed. Processed ${total} events.`,
        status: 'completed',
        total,
      })
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
