/**
 * Topics Aggregate API - Per-topic persistence metrics
 * GET - fetch per-topic persistence scores and top contributing events
 * Query: company_id, window_start, window_end
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AUTHORITY_WEIGHTS: Record<string, number> = {
  analyst: 1.0,
  media: 0.7,
  retail: 0.4,
  institutional: 0.8,
  unknown: 0.5,
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
  const url = new URL(req.url)

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  const companyId = url.searchParams.get('company_id') ?? ''
  const windowStart = url.searchParams.get('window_start') ?? ''
  const windowEnd = url.searchParams.get('window_end') ?? ''

  if (!companyId || !windowStart || !windowEnd) {
    return errorResponse('company_id, window_start, window_end are required', 400)
  }

  try {
    let query = supabase
      .from('narrative_event_append')
      .select('event_id, raw_text, original_timestamp, source, audience_class, authority_score, topic_labels, primary_topic')

    query = query
      .gte('original_timestamp', windowStart)
      .lte('original_timestamp', windowEnd)

    if (companyId) {
      query = query.filter('metadata->>company_ticker', 'ilike', `%${companyId}%`)
    }

    const { data: events, error } = await query.order('original_timestamp', { ascending: false })

    if (error) return errorResponse(error.message, 500)
    const list = Array.isArray(events) ? events : []

    const byTopic: Record<string, { score: number; count: number; events: Array<{ narrative_id: string; timestamp: string; source: string; snippet: string; weight: number }> }> = {}

    for (const ev of list) {
      const topic = ev.primary_topic ?? 'unknown'
      const aud = String(ev.audience_class ?? 'unknown').toLowerCase()
      const weight = AUTHORITY_WEIGHTS[aud] ?? 0.5
      const authScore = ev.authority_score != null ? Number(ev.authority_score) : weight
      const effectiveWeight = (authScore + weight) / 2

      if (!byTopic[topic]) {
        byTopic[topic] = { score: 0, count: 0, events: [] }
      }
      byTopic[topic].score += effectiveWeight
      byTopic[topic].count += 1
      if (byTopic[topic].events.length < 5) {
        byTopic[topic].events.push({
          narrative_id: ev.event_id,
          timestamp: ev.original_timestamp ?? '',
          source: ev.source ?? 'unknown',
          snippet: String(ev.raw_text ?? '').slice(0, 80) + (String(ev.raw_text ?? '').length > 80 ? '...' : ''),
          weight: effectiveWeight,
        })
      }
    }

    const items = Object.entries(byTopic).map(([topic_label, agg]) => ({
      id: crypto.randomUUID(),
      topic_label,
      period_start: windowStart,
      period_end: windowEnd,
      persistence_score: Math.round(agg.score * 100) / 100,
      authority_weighted_count: Math.round(agg.count * 100) / 100,
      top_contributing_events: agg.events,
    }))

    return jsonResponse({ items })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
