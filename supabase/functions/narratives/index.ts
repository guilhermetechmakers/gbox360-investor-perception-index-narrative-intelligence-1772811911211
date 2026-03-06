/**
 * Narratives API - Topic Classification & Narrative Persistence
 * GET - list narratives with topic labels (query: company_id, window_start, window_end, topics_only, limit, offset)
 * GET ?id= - fetch single narrative with full details
 * POST - ingest narrative event (append-only, with rule-based classification)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { classifyNarrative } from '../_shared/topic-classifier.ts'

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
  const singleId = url.searchParams.get('id')

  try {
    if (req.method === 'GET' && singleId) {
      if (!UUID_REGEX.test(singleId)) {
        return errorResponse('Invalid id', 400)
      }
      const { data, error } = await supabase
        .from('narrative_event_append')
        .select('*')
        .eq('event_id', singleId)
        .maybeSingle()

      if (error) return errorResponse(error.message, 500)
      if (!data) return errorResponse('Narrative not found', 404)

      const topicLabels = Array.isArray(data.topic_labels) ? data.topic_labels : (data.topic_labels as Record<string, unknown>[] ?? [])
      const items = [{
        ...data,
        id: data.event_id,
        event_id: data.event_id,
        text: data.raw_text,
        timestamp: data.original_timestamp,
        topic_labels: topicLabels,
        primary_topic: data.primary_topic ?? 'unknown',
        raw_payload: {},
      }]
      return jsonResponse(items[0])
    }

    if (req.method === 'GET') {
      const companyId = url.searchParams.get('company_id') ?? undefined
      const windowStart = url.searchParams.get('window_start') ?? undefined
      const windowEnd = url.searchParams.get('window_end') ?? undefined
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10), 1), 100)
      const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10), 0)

      let query = supabase
        .from('narrative_event_append')
        .select('*', { count: 'exact' })

      if (companyId) {
        query = query.filter('metadata->>company_ticker', 'ilike', `%${companyId}%`)
      }
      if (windowStart) {
        query = query.gte('original_timestamp', windowStart)
      }
      if (windowEnd) {
        query = query.lte('original_timestamp', windowEnd)
      }

      const { data: items, error, count } = await query
        .order('original_timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) return errorResponse(error.message, 500)
      const list = Array.isArray(items) ? items : []
      const mapped = list.map((row) => {
        const topicLabels = Array.isArray(row.topic_labels) ? row.topic_labels : (row.topic_labels as Record<string, unknown>[] ?? [])
        return {
          ...row,
          id: row.event_id,
          event_id: row.event_id,
          text: row.raw_text,
          timestamp: row.original_timestamp,
          topic_labels: topicLabels,
          primary_topic: row.primary_topic ?? 'unknown',
          raw_payload: {},
        }
      })
      return jsonResponse({ items: mapped, total: count ?? mapped.length })
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Record<string, unknown>
      const text = String(body?.text ?? body?.raw_text ?? '').trim()
      const source = String(body?.source ?? 'unknown').trim()
      const platform = String(body?.platform ?? 'unknown').trim()
      const speaker = String(body?.speaker ?? 'unknown').trim()
      const speakerRole = String(body?.speaker_role ?? 'unknown').trim()
      const audienceClass = String(body?.audience_class ?? 'unknown').trim()
      const timestamp = body?.timestamp as string | undefined
      const provenance = body?.provenance as Record<string, unknown> | undefined
      const rawPayload = body?.raw_payload as Record<string, unknown> | undefined

      if (!text || !source) {
        return errorResponse('text and source are required', 400)
      }
      if (!provenance || typeof provenance !== 'object') {
        return errorResponse('provenance is required', 400)
      }

      const classification = classifyNarrative(text)
      const now = new Date().toISOString()

      let rawPayloadId: string
      const existingRawId = body?.raw_payload_id as string | undefined
      if (existingRawId && UUID_REGEX.test(existingRawId)) {
        rawPayloadId = existingRawId
      } else {
        const externalId = `narr-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const { data: rp, error: rpErr } = await supabase
          .from('raw_payloads')
          .insert({
            external_id: externalId,
            source,
            payload: rawPayload ?? { text, source, timestamp },
            is_processed: true,
          })
          .select('id')
          .single()
        if (rpErr || !rp?.id) {
          return errorResponse('Failed to create raw payload', 500)
        }
        rawPayloadId = rp.id
      }

      const row = {
        raw_payload_id: rawPayloadId,
        source,
        platform,
        speaker_entity: speaker,
        speaker_role: speakerRole,
        audience_class: audienceClass,
        raw_text: text,
        ingestion_timestamp: now,
        original_timestamp: timestamp ? new Date(timestamp).toISOString() : now,
        metadata: (body?.metadata != null && typeof body.metadata === 'object') ? body.metadata : {},
        authority_score: body?.authority_score != null ? Number(body.authority_score) : null,
        credibility_flags: body?.credibility_flags ?? null,
        provenance: {
          ...provenance,
          write_timestamp: provenance.write_timestamp ?? now,
        },
        topic_labels: classification.top_topic_labels,
        primary_topic: classification.primary_topic,
        clustering_id: classification.clustering_id,
      }

      const { data, error } = await supabase
        .from('narrative_event_append')
        .insert(row)
        .select('event_id')
        .single()

      if (error) return errorResponse(error.message, 500)
      return jsonResponse({ event_id: data?.event_id ?? '', success: true }, 201)
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
