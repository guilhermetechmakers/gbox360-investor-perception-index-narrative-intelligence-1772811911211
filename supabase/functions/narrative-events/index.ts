/**
 * Narrative Events API - Supabase Edge Function
 * GET /functions/v1/narrative-events - list with filters (company, start, end, source, platform, audience_class, limit, offset, sort, order)
 * GET /functions/v1/narrative-events?event_id=... - fetch single event
 * POST /functions/v1/narrative-events - ingest new NarrativeEvent (append-only)
 * Uses narrative_event_append table. All writes are append-only; no updates/deletes.
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(s: string): boolean {
  return UUID_REGEX.test(s ?? '')
}

function mapRowToEvent(row: Record<string, unknown>): Record<string, unknown> {
  const meta = row.metadata as Record<string, unknown> | null
  return {
    event_id: row.event_id,
    raw_payload_id: row.raw_payload_id,
    source: row.source ?? '',
    platform: row.platform ?? 'unknown',
    speaker_entity: row.speaker_entity ?? 'unknown',
    speaker_role: row.speaker_role ?? 'unknown',
    audience_class: row.audience_class ?? 'unknown',
    raw_text: row.raw_text ?? '',
    ingestion_timestamp: row.ingestion_timestamp,
    original_timestamp: row.original_timestamp,
    metadata: meta ?? {},
    authority_score: row.authority_score,
    credibility_flags: row.credibility_flags,
    provenance: row.provenance ?? {},
    company_ticker: meta?.company_ticker ?? null,
    narrative_tag: meta?.narrative_tag ?? null,
  }
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
  const params = url.searchParams

  try {
    if (req.method === 'GET') {
      const eventId = params.get('event_id')
      if (eventId?.trim()) {
        const { data, error } = await supabase
          .from('narrative_event_append')
          .select('*')
          .eq('event_id', eventId.trim())
          .maybeSingle()

        if (error) return errorResponse(error.message, 500)
        if (!data) return errorResponse('Event not found', 404)
        return jsonResponse(mapRowToEvent(data))
      }

      const company = params.get('company') ?? undefined
      const start = params.get('start') ?? params.get('startDate') ?? undefined
      const end = params.get('end') ?? params.get('endDate') ?? undefined
      const source = params.get('source') ?? undefined
      const platform = params.get('platform') ?? undefined
      const audienceClass = params.get('audience_class') ?? undefined
      const limit = Math.min(Math.max(parseInt(params.get('limit') ?? '20', 10), 1), 100)
      const offset = Math.max(parseInt(params.get('offset') ?? '0', 10), 0)
      const sort = params.get('sort') ?? 'ingestion_timestamp'
      const order = params.get('order') === 'asc' ? 'asc' : 'desc'

      let query = supabase
        .from('narrative_event_append')
        .select('*', { count: 'exact' })

      if (company?.trim()) {
        query = query.filter('metadata->>company_ticker', 'ilike', `%${company.trim()}%`)
      }
      if (start?.trim()) {
        query = query.gte('original_timestamp', start.trim())
      }
      if (end?.trim()) {
        query = query.lte('original_timestamp', end.trim())
      }
      if (source?.trim()) {
        query = query.eq('source', source.trim())
      }
      if (platform?.trim()) {
        query = query.eq('platform', platform.trim())
      }
      if (audienceClass?.trim()) {
        query = query.eq('audience_class', audienceClass.trim())
      }

      const validSort = ['ingestion_timestamp', 'original_timestamp', 'source'].includes(sort)
        ? sort
        : 'ingestion_timestamp'
      const { data, error, count } = await query
        .order(validSort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

      if (error) return errorResponse(error.message, 500)
      const items = Array.isArray(data) ? data.map(mapRowToEvent) : []
      return jsonResponse({ items, total: count ?? items.length })
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Record<string, unknown>
      const eventId = body?.event_id as string | undefined
      const rawPayloadId = body?.raw_payload_id as string | undefined
      const source = body?.source as string | undefined
      const platform = body?.platform as string | undefined
      const speakerEntity = body?.speaker_entity as string | undefined
      const speakerRole = body?.speaker_role as string | undefined
      const audienceClass = body?.audience_class as string | undefined
      const rawText = body?.raw_text as string | undefined
      const ingestionTs = body?.ingestion_timestamp as string | undefined
      const originalTs = body?.original_timestamp as string | undefined
      const provenance = body?.provenance as Record<string, unknown> | undefined

      if (!eventId?.trim() || !isValidUUID(eventId.trim())) {
        return errorResponse('event_id is required and must be a valid UUID', 400)
      }
      if (!rawPayloadId?.trim() || !isValidUUID(rawPayloadId.trim())) {
        return errorResponse('raw_payload_id is required and must be a valid UUID', 400)
      }
      if (!source?.trim()) return errorResponse('source is required', 400)
      if (!rawText || typeof rawText !== 'string') return errorResponse('raw_text is required', 400)
      if (!ingestionTs?.trim()) return errorResponse('ingestion_timestamp is required', 400)
      if (!originalTs?.trim()) return errorResponse('original_timestamp is required', 400)
      if (!provenance || typeof provenance !== 'object') {
        return errorResponse('provenance is required (object with operator_id/ingest_system_id/write_timestamp)', 400)
      }

      const prov = provenance as Record<string, unknown>
      if (!prov.operator_id && !prov.ingest_system_id) {
        return errorResponse('provenance must include operator_id or ingest_system_id', 400)
      }
      if (!prov.write_timestamp) {
        return errorResponse('provenance must include write_timestamp', 400)
      }

      const metadata = (body?.metadata as Record<string, unknown>) ?? {}
      const authorityScore = body?.authority_score
      const credibilityFlags = body?.credibility_flags

      const row = {
        event_id: eventId.trim(),
        raw_payload_id: rawPayloadId.trim(),
        source: source.trim(),
        platform: (platform ?? 'unknown').trim(),
        speaker_entity: (speakerEntity ?? 'unknown').trim(),
        speaker_role: (speakerRole ?? 'unknown').trim(),
        audience_class: (audienceClass ?? 'unknown').trim(),
        raw_text: rawText,
        ingestion_timestamp: ingestionTs.trim(),
        original_timestamp: originalTs.trim(),
        metadata: metadata,
        authority_score: typeof authorityScore === 'number' && authorityScore >= 0 && authorityScore <= 1
          ? authorityScore
          : null,
        credibility_flags: credibilityFlags ?? null,
        provenance: { ...provenance },
      }

      const { error } = await supabase.from('narrative_event_append').insert(row)

      if (error) {
        if (error.code === '23505') return errorResponse('Event already exists (duplicate event_id)', 409)
        return errorResponse(error.message, 500)
      }

      return jsonResponse({ success: true, event_id: eventId.trim() }, 201)
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
