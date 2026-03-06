/**
 * Narrative Events API - Supabase Edge Function
 * GET /functions/v1/narrative-events - list events (query: company, start, end, source, platform, audience_class, limit, offset, sort, order)
 * GET /functions/v1/narrative-events?event_id= - fetch single event
 * POST /functions/v1/narrative-events - ingest new event
 * Uses narrative_event_append table (append-only).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  const eventId = url.searchParams.get('event_id')

  try {
    if (req.method === 'GET' && eventId) {
      // Single event
      if (!UUID_REGEX.test(eventId)) {
        return errorResponse('Invalid event_id', 400)
      }
      const { data, error } = await supabase
        .from('narrative_event_append')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle()

      if (error) return errorResponse(error.message, 500)
      if (!data) return errorResponse('Event not found', 404)
      return jsonResponse(data)
    }

    if (req.method === 'GET') {
      // List events
      const company = url.searchParams.get('company') ?? undefined
      const start = url.searchParams.get('start') ?? undefined
      const end = url.searchParams.get('end') ?? undefined
      const source = url.searchParams.get('source') ?? undefined
      const platform = url.searchParams.get('platform') ?? undefined
      const audienceClass = url.searchParams.get('audience_class') ?? undefined
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10), 1), 100)
      const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10), 0)
      const sort = url.searchParams.get('sort') ?? 'original_timestamp'
      const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'

      let query = supabase
        .from('narrative_event_append')
        .select('*', { count: 'exact' })

      if (company) {
        query = query.filter('metadata->>company_ticker', 'ilike', `%${company}%`)
      }
      if (start) {
        query = query.gte('original_timestamp', start)
      }
      if (end) {
        query = query.lte('original_timestamp', end)
      }
      if (source) {
        query = query.eq('source', source)
      }
      if (platform) {
        query = query.eq('platform', platform)
      }
      if (audienceClass) {
        query = query.eq('audience_class', audienceClass)
      }

      const { data: items, error, count } = await query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

      if (error) return errorResponse(error.message, 500)
      const list = Array.isArray(items) ? items : []
      return jsonResponse({ items: list, total: count ?? list.length })
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Record<string, unknown>
      const rawPayloadId = body?.raw_payload_id as string | undefined
      const source = body?.source as string | undefined
      const platform = String(body?.platform ?? 'unknown').trim() || 'unknown'
      const rawText = String(body?.raw_text ?? body?.text ?? '').trim()
      const originalTimestamp = body?.original_timestamp as string | undefined
      const provenance = body?.provenance as Record<string, unknown> | undefined

      if (!rawPayloadId?.trim() || !source?.trim() || !rawText) {
        return errorResponse('raw_payload_id, source, and raw_text are required', 400)
      }
      if (!UUID_REGEX.test(rawPayloadId)) {
        return errorResponse('raw_payload_id must be a valid UUID', 400)
      }
      if (!provenance || typeof provenance !== 'object') {
        return errorResponse('provenance is required with operator_id, ingest_system_id, write_timestamp', 400)
      }

      const now = new Date().toISOString()
      const row = {
        raw_payload_id: rawPayloadId.trim(),
        source: source.trim(),
        platform,
        speaker_entity: String(body?.speaker_entity ?? 'unknown').trim() || 'unknown',
        speaker_role: String(body?.speaker_role ?? 'unknown').trim() || 'unknown',
        audience_class: String(body?.audience_class ?? 'unknown').trim() || 'unknown',
        raw_text: rawText,
        ingestion_timestamp: now,
        original_timestamp: originalTimestamp ? new Date(originalTimestamp).toISOString() : now,
        metadata: (body?.metadata != null && typeof body.metadata === 'object') ? body.metadata : {},
        authority_score: body?.authority_score != null ? Number(body.authority_score) : null,
        credibility_flags: body?.credibility_flags ?? null,
        provenance: {
          ...provenance,
          write_timestamp: provenance.write_timestamp ?? now,
        },
      }

      const { data, error } = await supabase
        .from('narrative_event_append')
        .insert(row)
        .select('event_id')
        .single()

      if (error) return errorResponse(error.message, 500)
      return jsonResponse({ event_id: data?.event_id, success: true }, 201)
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
