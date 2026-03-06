/**
 * Narrative Events Validation - Supabase Edge Function
 * POST /functions/v1/narrative-events-validation - validate incoming payload structure
 * GET /functions/v1/narrative-events-validation - return schema validation rules
 */

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

function validatePayload(body: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!body?.raw_payload_id?.trim()) errors.push('raw_payload_id is required')
  else if (!UUID_REGEX.test(String(body.raw_payload_id))) errors.push('raw_payload_id must be a valid UUID')

  if (!body?.source?.trim()) errors.push('source is required')

  if (body?.raw_text == null && body?.text == null) errors.push('raw_text or text is required')
  else if (typeof (body?.raw_text ?? body?.text) !== 'string') errors.push('raw_text must be a string')

  if (!body?.provenance || typeof body.provenance !== 'object') {
    errors.push('provenance is required (object with operator_id, ingest_system_id, write_timestamp)')
  } else {
    const p = body.provenance as Record<string, unknown>
    if (!p.operator_id && !p.ingest_system_id) {
      errors.push('provenance must include operator_id or ingest_system_id')
    }
    if (!p.write_timestamp) errors.push('provenance.write_timestamp is required')
  }

  if (body?.original_timestamp) {
    const t = new Date(String(body.original_timestamp))
    if (isNaN(t.getTime())) errors.push('original_timestamp must be a valid ISO timestamp')
  }

  if (body?.metadata != null && typeof body.metadata !== 'object') {
    errors.push('metadata must be an object')
  }

  if (body?.authority_score != null) {
    const n = Number(body.authority_score)
    if (isNaN(n) || n < 0 || n > 1) errors.push('authority_score must be between 0 and 1')
  }

  return { valid: errors.length === 0, errors }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method === 'GET') {
      return jsonResponse({
        schema: {
          required: ['raw_payload_id', 'source', 'raw_text', 'provenance'],
          optional: ['platform', 'speaker_entity', 'speaker_role', 'audience_class', 'metadata', 'authority_score', 'credibility_flags', 'original_timestamp'],
          provenance_required: ['operator_id or ingest_system_id', 'write_timestamp'],
        },
      })
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Record<string, unknown>
      const { valid, errors } = validatePayload(body ?? {})
      return jsonResponse({ valid, errors })
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500)
  }
})
