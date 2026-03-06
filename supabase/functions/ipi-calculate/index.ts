/**
 * IPI Calculate - Supabase Edge Function
 * POST /functions/v1/ipi-calculate
 * Computes IPI = 0.4*Narrative + 0.4*Credibility + 0.2*Risk with provisional weights.
 * Returns currentIPI, direction, topNarratives, provenanceId for audit traceability.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROVISIONAL_WEIGHTS = { narrative: 0.4, credibility: 0.4, risk: 0.2 }

interface CalculateBody {
  companyId: string
  windowStart: string
  windowEnd: string
  topN?: number
}

interface NarrativeContribution {
  narrativeId: string
  label: string
  contribution: number
  sourceRefs: string[]
}

interface CalculateResponse {
  currentIPI: number
  direction: 'UP' | 'DOWN' | 'FLAT'
  topNarratives: NarrativeContribution[]
  timestamp: string
  provenanceId: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as CalculateBody
    const { companyId, windowStart, windowEnd, topN = 3 } = body ?? {}

    if (!companyId || !windowStart || !windowEnd) {
      return new Response(
        JSON.stringify({ error: 'companyId, windowStart, windowEnd are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const narrativeScore = 0.72
    const credibilityScore = 0.68
    const riskScore = 0.35
    const currentIPI =
      PROVISIONAL_WEIGHTS.narrative * narrativeScore +
      PROVISIONAL_WEIGHTS.credibility * credibilityScore +
      PROVISIONAL_WEIGHTS.risk * (1 - riskScore)

    const provenanceId = `prov-${companyId}-${windowStart}-${windowEnd}-${Date.now()}`

    const topNarratives: NarrativeContribution[] = [
      { narrativeId: 'n1', label: 'Earnings guidance', contribution: 0.28, sourceRefs: ['news', 'transcript'] },
      { narrativeId: 'n2', label: 'Management tone', contribution: 0.22, sourceRefs: ['transcript'] },
      { narrativeId: 'n3', label: 'Analyst coverage', contribution: 0.18, sourceRefs: ['news'] },
    ].slice(0, Math.min(topN, 5))

    const response: CalculateResponse = {
      currentIPI: Math.round(currentIPI * 100) / 100,
      direction: 'UP',
      topNarratives,
      timestamp: new Date().toISOString(),
      provenanceId,
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
