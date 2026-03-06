/**
 * NewsAPI Fetcher - Supabase Edge Function
 * Scheduled fetcher for NewsAPI. Rate-aware, exponential backoff, idempotent.
 * Fetches articles by company ticker, normalizes to NarrativeEvent, stores RawPayload.
 * Required secrets: NEWSAPI_API_KEY
 * Optional: SUPABASE_SERVICE_ROLE_KEY (for DB), NEWSAPI_RATE_LIMIT (default 100/day)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NEWSAPI_BASE = 'https://newsapi.org/v2'

async function fetchWithBackoff(
  url: string,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)
    if (res.ok) return res
    if (res.status === 429) {
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
      await new Promise((r) => setTimeout(r, delay))
      continue
    }
    if (res.status >= 500 && i < retries - 1) {
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000))
      continue
    }
    return res
  }
  throw new Error('Max retries exceeded')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('NEWSAPI_API_KEY') ?? ''
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'NEWSAPI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const ticker = url.searchParams.get('q') ?? url.searchParams.get('ticker') ?? 'AAPL'

    const newsUrl = `${NEWSAPI_BASE}/everything?q=${encodeURIComponent(ticker)}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
    const res = await fetchWithBackoff(newsUrl)

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `NewsAPI error: ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = (await res.json()) as { articles?: Array<Record<string, unknown>> }
    const articles = Array.isArray(data?.articles) ? data.articles : []

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({
          success: true,
          count: articles.length,
          message: 'Supabase not configured; articles fetched but not stored',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    let stored = 0

    for (const art of articles) {
      const extId = String(art?.url ?? art?.title ?? `${ticker}-${Date.now()}-${Math.random()}`)
      const source = 'newsapi'

      const { data: existing } = await supabase
        .from('raw_payloads')
        .select('id')
        .eq('external_id', extId)
        .eq('source', source)
        .maybeSingle()

      if (existing) continue

      const { data: rawPayload, error: insertErr } = await supabase
        .from('raw_payloads')
        .insert({
          external_id: extId,
          source,
          payload: art,
          batch_id: null,
          is_processed: false,
        })
        .select('id')
        .single()

      if (insertErr) continue

      const rawId = rawPayload?.id
      if (!rawId) continue

      const text = String(art?.title ?? '') + ' ' + String(art?.description ?? '')
      const { error: evtErr } = await supabase.from('narrative_events').insert({
        external_id: extId,
        source,
        speaker_entity: String(art?.source?.name ?? art?.author ?? ''),
        speaker_role: 'media',
        audience_class: 'investors',
        text,
        timestamp: art?.publishedAt ? new Date(String(art.publishedAt)).toISOString() : new Date().toISOString(),
        provenance: {
          raw_payload_id: rawId,
          ingestion_pipeline: 'newsapi-fetch',
          transformed_at: new Date().toISOString(),
          version: '1.0',
        },
      })

      if (!evtErr) {
        stored++
        await supabase
          .from('raw_payloads')
          .update({ is_processed: true, updated_at: new Date().toISOString() })
          .eq('id', rawId)
      }
    }

    return new Response(
      JSON.stringify({ success: true, fetched: articles.length, stored }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
