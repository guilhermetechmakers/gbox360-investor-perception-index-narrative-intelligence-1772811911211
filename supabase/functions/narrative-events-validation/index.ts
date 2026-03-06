/**
 * Narrative Events Validation - Supabase Edge Function
 * GET /functions/v1/narrative-events-validation - validate payload structure
 * POST /functions/v1/narrative-events-validation - validate payload from body
 * Returns { valid: boolean, errors?: string[] }
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(s: string): boolean {
  return UUID_REGEX.test(s ?? '')
}

function validatePayload(body: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (body == null || typeof body !== 'object') {
    return { valid: false, errors: ['Payload must be an object'] }
  }

  const b = body as Record<string, unknown>

  if (!b.event_id || typeof b.event_id !== 'string' || !isValidUUID(b.event_id.trim())) {
    errors.push('event_id is required and must be a valid UUID')
  }
  if (!b.raw_payload_id || typeof b.raw_payload_id !== 'string' || !isValidUUID(b.raw_payload_id.trim())) {
    errors.push('raw_payload_id is required and must be a valid UUID')
  }
  if (!b.source || typeof b.source !== 'string' || !String(b.source).trim()) {
    errors.push('source is required')
  }
  if (!b.raw_text || typeof b.raw_text !== 'string') {
    errors.push('raw_text is required')
  }
  if (!b.ingestion_timestamp || typeof b.ingestion_timestamp !== 'string' || !String(b.ingestion_timestamp).trim()) {
    errors.push('ingestion_timestamp is required (ISO string)')
  }
  if (!b.original_timestamp || typeof b.original_timestamp !== 'string' || !String(b.original_timestamp).trim()) {
    errors.push('original_timestamp is required (ISO string)')
  }

  const prov = b.provenance
  if (!prov || typeof prov !== 'object') {
    errors.push('provenance is required (object)')
  } else {
    const p = prov as Record<string, unknown>
    if (!p.operator_id && !p.ingest_system_id) {
      errors.push('provenance must include operator_id or ingest_system_id')
    }
    if (!p.write_timestamp) {
      errors.push('provenance must include write_timestamp')
    }
  }

  if (b.platform != null && typeof b.platform !== 'string') {
    errors.push('platform must be a string if provided')
  }
  if (b.authority_score != null) {
    const v = Number(b.authority_score)
    if (Number.isNaN(v) || v < 0 || v > 1) {
      errors.push('authority_score must be a number between 0 and 1 if provided')
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined as unknown as string[],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse({ valid: false, errors: ['Method not allowed'] }, 405)
  }

  let body: unknown = null
  if (req.method === 'POST') {
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ valid: false, errors: ['Invalid JSON body'] }, 400)
    }
  } else {
    const url = new URL(req.url)
    const payloadParam = url.searchParams.get('payload')
    if (payloadParam) {
      try {
        body = JSON.parse(decodeURIComponent(payloadParam))
      } catch {
        return jsonResponse({ valid: false, errors: ['Invalid payload query parameter (must be JSON)'] }, 400)
      }
    }
  }

  if (body == null) {
    return jsonResponse({
      valid: false,
      errors: ['No payload provided. Use POST with JSON body or GET ?payload=<encoded JSON>'],
    }, 400)
  }

  const result = validatePayload(body)
  return jsonResponse(result)
})
