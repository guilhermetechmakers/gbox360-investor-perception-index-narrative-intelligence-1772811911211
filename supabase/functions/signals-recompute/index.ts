/**
 * Signals Recompute - Re-score credibility and risk signals for narratives.
 * POST body: { narrative_ids?: string[], window?: string, company_id?: string, start?: string, end?: string }
 * Returns: { updated_count: number }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { computeSignals } from '../_shared/signals-engine.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const narrativeIds = Array.isArray(body?.narrative_ids) ? body.narrative_ids as string[] : []
    const companyId = typeof body?.company_id === 'string' ? body.company_id : undefined
    const start = typeof body?.start === 'string' ? body.start : undefined
    const end = typeof body?.end === 'string' ? body.end : undefined
    const window = typeof body?.window === 'string' ? body.window : undefined

    let query = supabase.from('narrative_event_append').select('event_id, raw_text, source, platform, speaker_entity, speaker_role, original_timestamp')

    if (narrativeIds.length > 0) {
      query = query.in('event_id', narrativeIds)
    } else {
      if (companyId) {
        query = query.filter('metadata->>company_ticker', 'ilike', `%${companyId}%`)
      }
      const startDate = start ?? (window ? window.split('/')[0] : undefined)
      const endDate = end ?? (window ? window.split('/')[1] : undefined)
      if (startDate) query = query.gte('original_timestamp', startDate)
      if (endDate) query = query.lte('original_timestamp', endDate)
    }

    const { data: rows, error } = await query.limit(500)

    if (error) return errorResponse(error.message, 500)
    const list = Array.isArray(rows) ? rows : []
    let updatedCount = 0

    for (const row of list) {
      const eventId = row?.event_id ?? ''
      const rawText = row?.raw_text ?? ''
      if (!eventId || !rawText) continue

      const out = computeSignals({
        raw_text: rawText,
        source: row?.source,
        platform: row?.platform,
        speaker_entity: row?.speaker_entity,
        speaker_role: row?.speaker_role,
        event_id: eventId,
        narrative_id: eventId,
      })

      const { error: updateErr } = await supabase
        .from('narrative_event_append')
        .update({
          credibility_score: out.credibility_score,
          risk_score: out.risk_score,
          signals: out.signals ?? [],
        })
        .eq('event_id', eventId)

      if (!updateErr) updatedCount += 1
    }

    return jsonResponse({ updated_count: updatedCount })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
