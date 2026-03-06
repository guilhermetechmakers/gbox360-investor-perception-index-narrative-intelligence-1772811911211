/**
 * Ingest Replay - Supabase Edge Function
 * POST /functions/v1/ingest-replay
 * Manual replay of raw payload or narrative event. Idempotent.
 * Body: { raw_payload_id: string, narrative_event_id?: string, force?: boolean }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReplayBody {
  raw_payload_id?: string
  narrative_event_id?: string
  force?: boolean
  sourceId?: string
  batchId?: string
  idempotencyKey?: string
}

function normalizeToNarrativeEvent(
  payload: Record<string, unknown>,
  rawId: string,
  extId: string,
  source: string
): Record<string, unknown> {
  const text = String(payload?.text ?? payload?.raw_text ?? payload?.content ?? '')
  return {
    external_id: extId,
    source,
    speaker_entity: String(payload?.speaker ?? payload?.speaker_entity ?? ''),
    speaker_role: String(payload?.speaker_role ?? ''),
    audience_class: String(payload?.audience ?? payload?.audience_class ?? ''),
    text,
    timestamp: payload?.timestamp
      ? new Date(String(payload.timestamp)).toISOString()
      : new Date().toISOString(),
    provenance: {
      raw_payload_id: rawId,
      ingestion_pipeline: 'replay',
      transformed_at: new Date().toISOString(),
      version: '1.0',
    },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as ReplayBody
    const { raw_payload_id, narrative_event_id, force } = body ?? {}

    if (!raw_payload_id?.trim()) {
      return new Response(
        JSON.stringify({ error: 'raw_payload_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: rawPayload, error: fetchErr } = await supabase
      .from('raw_payloads')
      .select('*')
      .eq('id', raw_payload_id.trim())
      .maybeSingle()

    if (fetchErr || !rawPayload) {
      return new Response(
        JSON.stringify({ error: 'Raw payload not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = (rawPayload.payload as Record<string, unknown>) ?? {}
    const extId = rawPayload.external_id ?? rawPayload.id
    const source = rawPayload.source ?? 'unknown'

    if (force || !rawPayload.is_processed) {
      const evt = normalizeToNarrativeEvent(payload, rawPayload.id, extId, source)
      const { error: insertErr } = await supabase.from('narrative_events').insert(evt)

      if (insertErr) {
        return new Response(
          JSON.stringify({ error: insertErr.message, success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase
        .from('raw_payloads')
        .update({ is_processed: true, updated_at: new Date().toISOString() })
        .eq('id', raw_payload_id)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Replay completed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})