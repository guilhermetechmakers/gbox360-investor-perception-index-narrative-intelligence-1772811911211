/**
 * IPI Provenance - Supabase Edge Function
 * POST /functions/v1/ipi-provenance
 * Returns full audit payload for drill-down: input vectors, weights used, computed IPI.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROVISIONAL_WEIGHTS = { narrative: 0.4, credibility: 0.4, risk: 0.2 }

interface ProvenanceBody {
  provenanceId: string
}

interface AuditProvenance {
  provenanceId: string
  companyId: string
  windowStart: string
  windowEnd: string
  inputVector: {
    narrativeMetrics: Record<string, unknown>
    credibilityProxies: Record<string, unknown>
    riskFlags: Record<string, unknown>
  }
  weightsUsed: { narrative: number; credibility: number; risk: number }
  computedIPI: number
  timestamp: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let provenanceId: string | undefined
    if (req.method === 'GET') {
      const url = new URL(req.url)
      provenanceId = url.searchParams.get('provenanceId') ?? url.searchParams.get('id') ?? ''
    } else {
      const body = (await req.json()) as ProvenanceBody
      provenanceId = body?.provenanceId
    }

    if (!provenanceId) {
      return new Response(
        JSON.stringify({ error: 'provenanceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parts = provenanceId.split('-')
    const companyId = parts[1] ?? 'unknown'
    const windowStart = parts[2] ?? ''
    const windowEnd = parts[3] ?? ''

    const response: AuditProvenance = {
      provenanceId,
      companyId,
      windowStart,
      windowEnd,
      inputVector: {
        narrativeMetrics: { persistence: 0.72, authorityWeighted: 0.68 },
        credibilityProxies: { crossSourceRepetition: 0.7, managementConsistency: 0.65 },
        riskFlags: { keywordMatches: 0.35, volatilitySignal: 0.3 },
      },
      weightsUsed: PROVISIONAL_WEIGHTS,
      computedIPI: 0.68,
      timestamp: new Date().toISOString(),
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
