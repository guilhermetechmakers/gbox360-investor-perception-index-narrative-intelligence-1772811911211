/**
 * Transcript Batch Ingestion - Supabase Edge Function
 * POST /functions/v1/ingest-transcripts-batch
 * Triggers batch ingestion from manifest URL. Idempotent.
 * Required secrets: SUPABASE_SERVICE_ROLE_KEY (for DB access)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BatchRequest {
  batch_manifest_url?: string
  batch_id: string
  company: string
  ingestion_window?: string
}

export interface TranscriptBatchStatus {
  batch_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial'
  total_items: number
  processed: number
  failed: number
  skipped: number
  started_at?: string
  completed_at?: string
  errors?: Array<{ item_id: string; message: string; error_code?: string }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as BatchRequest
    const { batch_manifest_url, batch_id, company, ingestion_window } = body ?? {}

    if (!batch_id?.trim() || !company?.trim()) {
      return new Response(
        JSON.stringify({ error: 'batch_id and company are required' }),
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

    // Upsert batch status as pending
    const now = new Date().toISOString()
    const { error: upsertErr } = await supabase
      .from('transcript_batch_status')
      .upsert(
        {
          batch_id: batch_id.trim(),
          status: 'pending',
          total_items: 0,
          processed: 0,
          failed: 0,
          skipped: 0,
          started_at: now,
          updated_at: now,
        },
        { onConflict: 'batch_id' }
      )

    if (upsertErr) {
      return new Response(
        JSON.stringify({ error: upsertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If manifest URL provided, fetch and process (simplified: just mark in_progress for async worker)
    if (batch_manifest_url?.trim()) {
      try {
        const manifestRes = await fetch(batch_manifest_url.trim())
        if (!manifestRes.ok) {
          await supabase
            .from('transcript_batch_status')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              errors: [{ item_id: 'manifest', message: `Failed to fetch manifest: ${manifestRes.status}` }],
              updated_at: new Date().toISOString(),
            })
            .eq('batch_id', batch_id)
          return new Response(
            JSON.stringify({ success: true, batch_id, message: 'Manifest fetch failed' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const manifest = (await manifestRes.json()) as { items?: unknown[] }
        const items = Array.isArray(manifest?.items) ? manifest.items : []
        const total = items.length

        await supabase
          .from('transcript_batch_status')
          .update({
            status: 'in_progress',
            total_items: total,
            updated_at: new Date().toISOString(),
          })
          .eq('batch_id', batch_id)

        let processed = 0
        let failed = 0
        let skipped = 0
        const errors: Array<{ item_id: string; message: string; error_code?: string }> = []

        for (let i = 0; i < items.length; i++) {
          const item = items[i] as Record<string, unknown>
          const extId = String(item?.external_id ?? item?.id ?? `item-${i}`)
          const source = String(item?.source ?? 'transcript')
          const payload = item?.payload ?? item ?? {}

          const { data: existing } = await supabase
            .from('raw_payloads')
            .select('id')
            .eq('external_id', extId)
            .eq('source', source)
            .maybeSingle()

          if (existing) {
            skipped++
            continue
          }

          const { data: rawPayload, error: insertErr } = await supabase
            .from('raw_payloads')
            .insert({
              external_id: extId,
              source,
              payload: typeof payload === 'object' ? payload : { raw: payload },
              batch_id: batch_id,
              is_processed: false,
            })
            .select('id')
            .single()

          if (insertErr) {
            failed++
            errors.push({ item_id: extId, message: insertErr.message, error_code: insertErr.code })
            continue
          }

          const rawId = rawPayload?.id
          if (!rawId) {
            failed++
            errors.push({ item_id: extId, message: 'Insert returned no id' })
            continue
          }

          const text = String(item?.text ?? item?.raw_text ?? item?.content ?? '')
          const provenance = {
            raw_payload_id: rawId,
            ingestion_pipeline: 'transcript-batch',
            transformed_at: new Date().toISOString(),
            version: '1.0',
          }

          const { error: evtErr } = await supabase.from('narrative_events').insert({
            external_id: extId,
            source,
            speaker_entity: String(item?.speaker ?? item?.speaker_entity ?? ''),
            speaker_role: String(item?.speaker_role ?? ''),
            audience_class: String(item?.audience ?? item?.audience_class ?? ''),
            text,
            timestamp: item?.timestamp ? new Date(String(item.timestamp)).toISOString() : new Date().toISOString(),
            provenance,
          })

          if (evtErr) {
            failed++
            errors.push({ item_id: extId, message: evtErr.message })
          } else {
            processed++
            await supabase
              .from('raw_payloads')
              .update({ is_processed: true, updated_at: new Date().toISOString() })
              .eq('id', rawId)
          }
        }

        const finalStatus = failed > 0 && processed > 0 ? 'partial' : failed > 0 ? 'failed' : 'completed'
        await supabase
          .from('transcript_batch_status')
          .update({
            status: finalStatus,
            processed,
            failed,
            skipped,
            completed_at: new Date().toISOString(),
            errors: errors.length > 0 ? errors : [],
            updated_at: new Date().toISOString(),
          })
          .eq('batch_id', batch_id)
      } catch (fetchErr) {
        await supabase
          .from('transcript_batch_status')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            errors: [{ item_id: 'manifest', message: String(fetchErr) }],
            updated_at: new Date().toISOString(),
          })
          .eq('batch_id', batch_id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, batch_id, job_id: `job-${batch_id}-${Date.now()}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
