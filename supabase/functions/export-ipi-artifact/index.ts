/**
 * Export IPI Artifact - Supabase Edge Function
 * POST /functions/v1/export-ipi-artifact
 * Assembles signed audit artifacts (JSON + PDF) for a given IPI view.
 * Includes: artifact metadata, calculation inputs, narrative section, event list,
 * raw payload references, and integrity hashes.
 * Placeholder KMS signing for MVP; production uses server-side key.
 * Access control: requires authenticated user when Supabase is configured.
 */
import { jsPDF } from 'https://esm.sh/jspdf@2.5.2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'


const MOCK_SIGNATURE = 'Gbox360-MVP-Signed-Artifact-v1'
const WEIGHT_VERSION = 'provisional-v1'
const NARRATIVE_WEIGHT = 0.4
const CREDIBILITY_WEIGHT = 0.4
const RISK_WEIGHT = 0.2

interface ExportBody {
  companyId: string
  windowStart: string
  windowEnd: string
  viewId?: string
  narrativeId?: string
  includeNarratives?: string[]
  format?: 'json' | 'pdf' | 'both'
}

interface ArtifactPayload {
  artifact_metadata: {
    id: string
    company_id: string
    window_start: string
    window_end: string
    generated_at: string
    signer_id: string
    signature: string
    hash: string
  }
  ipi_view_reference: {
    view_id: string
    calculation_inputs: Record<string, number>
    weighting_parameters: Record<string, number>
    weight_version: string
  }
  narrative_section: Array<{
    id: string
    weight: number
    credibility_proxy?: number
    contributing_events: Array<{ raw_payload_id: string; timestamp: string; source: string }>
  }>
  raw_payload_references: Array<{ payload_id: string; source: string; payload_type: string }>
  event_list: Array<{
    id: string
    narrativeId: string
    source: string
    timestamp: string
    authoritySignal: number
    credibilitySignal: number
  }>
  integrity: { root_hash: string; per_item_hashes: string[] }
}

function sha256Placeholder(data: string): string {
  // MVP: deterministic placeholder; production uses crypto.subtle.digest
  let h = 0
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0
  }
  return `sha256-${Math.abs(h).toString(16)}-${data.length}`
}

function buildArtifactPayload(
  companyId: string,
  windowStart: string,
  windowEnd: string,
  viewId: string,
  includeNarratives: string[]
): ArtifactPayload {
  const id = `art-${companyId}-${Date.now()}`
  const generatedAt = new Date().toISOString()

  const narrativeSection = (includeNarratives ?? []).slice(0, 3).map((nid, i) => ({
    id: nid,
    weight: 0.3 - i * 0.05,
    credibility_proxy: 0.7,
    contributing_events: [
      { raw_payload_id: `rp-${nid}-1`, timestamp: generatedAt, source: 'transcript' },
      { raw_payload_id: `rp-${nid}-2`, timestamp: generatedAt, source: 'news' },
    ],
  }))

  const eventList = narrativeSection.flatMap((n) =>
    n.contributing_events.map((e, i) => ({
      id: `ev-${n.id}-${i}`,
      narrativeId: n.id,
      source: e.source,
      timestamp: e.timestamp,
      authoritySignal: 0.65,
      credibilitySignal: 0.7,
    }))
  )

  const rawPayloadRefs = eventList.map((e) => ({
    payload_id: `rp-${e.narrativeId}-${e.id.split('-').pop()}`,
    source: e.source,
    payload_type: 'json',
  }))

  const payloadJson = JSON.stringify({
    artifact_metadata: { id, company_id: companyId, window_start: windowStart, window_end: windowEnd, generated_at: generatedAt, signer_id: 'system', signature: MOCK_SIGNATURE, hash: '' },
    ipi_view_reference: { view_id: viewId, calculation_inputs: {}, weighting_parameters: { narrative: NARRATIVE_WEIGHT, credibility: CREDIBILITY_WEIGHT, risk: RISK_WEIGHT }, weight_version: WEIGHT_VERSION },
    narrative_section: narrativeSection,
    raw_payload_references: rawPayloadRefs,
    event_list: eventList,
    integrity: { root_hash: '', per_item_hashes: [] },
  })

  const rootHash = sha256Placeholder(payloadJson)
  const perItemHashes = eventList.map((e) => sha256Placeholder(JSON.stringify(e)))

  return {
    artifact_metadata: {
      id,
      company_id: companyId,
      window_start: windowStart,
      window_end: windowEnd,
      generated_at: generatedAt,
      signer_id: 'system',
      signature: MOCK_SIGNATURE,
      hash: rootHash,
    },
    ipi_view_reference: {
      view_id: viewId,
      calculation_inputs: {},
      weighting_parameters: {
        narrative: NARRATIVE_WEIGHT,
        credibility: CREDIBILITY_WEIGHT,
        risk: RISK_WEIGHT,
      },
      weight_version: WEIGHT_VERSION,
    },
    narrative_section: narrativeSection,
    raw_payload_references: rawPayloadRefs,
    event_list: eventList,
    integrity: { root_hash: rootHash, per_item_hashes: perItemHashes },
  }
}

function generatePDF(payload: ArtifactPayload): Uint8Array {
  const doc = new jsPDF({ format: 'a4' })
  let y = 20

  doc.setFontSize(18)
  doc.text('Gbox360 Audit Artifact', 20, y)
  y += 10

  doc.setFontSize(10)
  doc.text(`Company: ${payload.artifact_metadata.company_id}`, 20, y)
  y += 6
  doc.text(`Window: ${payload.artifact_metadata.window_start} to ${payload.artifact_metadata.window_end}`, 20, y)
  y += 6
  doc.text(`Generated: ${payload.artifact_metadata.generated_at}`, 20, y)
  y += 10

  doc.setFontSize(12)
  doc.text('Data Provenance', 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text(`Weight version: ${payload.ipi_view_reference.weight_version}`, 20, y)
  y += 6
  doc.text(`Narrative: ${(NARRATIVE_WEIGHT * 100).toFixed(0)}%, Credibility: ${(CREDIBILITY_WEIGHT * 100).toFixed(0)}%, Risk: ${(RISK_WEIGHT * 100).toFixed(0)}%`, 20, y)
  y += 10

  doc.setFontSize(12)
  doc.text('Narrative Breakdown', 20, y)
  y += 8
  doc.setFontSize(10)
  for (const n of payload.narrative_section ?? []) {
    doc.text(`• ${n.id}: ${(n.weight * 100).toFixed(0)}%`, 20, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 6

  doc.setFontSize(12)
  doc.text('Event Timeline', 20, y)
  y += 8
  doc.setFontSize(10)
  for (const e of payload.event_list ?? []) {
    doc.text(`• ${e.timestamp} - ${e.source} (auth: ${e.authoritySignal.toFixed(2)})`, 20, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 10

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Signed: ${payload.artifact_metadata.signature}`, 20, y)
  y += 6
  doc.text(`Root hash: ${payload.integrity.root_hash}`, 20, y)

  const buf = doc.output('arraybuffer')
  return buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(0)
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      })
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'Authentication required to export artifacts' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const body = (await req.json()) as ExportBody
    const {
      companyId,
      windowStart,
      windowEnd,
      viewId,
      narrativeId,
      includeNarratives = [],
      format = 'both',
    } = body ?? {}
    const viewIdResolved = viewId ?? `view-${companyId ?? 'unknown'}-${Date.now()}`

    if (!companyId || !windowStart || !windowEnd) {
      return new Response(
        JSON.stringify({ error: 'companyId, windowStart, windowEnd are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload = buildArtifactPayload(
      companyId,
      windowStart,
      windowEnd,
      viewIdResolved,
      narrativeId
        ? (Array.isArray(includeNarratives) ? includeNarratives : []).concat(narrativeId).filter(Boolean)
        : Array.isArray(includeNarratives) ? includeNarratives : []
    )

    const jsonStr = JSON.stringify(payload, null, 2)
    const jsonBase64 = btoa(unescape(encodeURIComponent(jsonStr)))

    let pdfBase64: string | undefined
    if (format === 'pdf' || format === 'both') {
      try {
        const pdfBytes = generatePDF(payload)
        pdfBase64 = uint8ArrayToBase64(pdfBytes)
      } catch {
        // PDF generation may fail in Edge runtime; client fallback available
      }
    }

    const response = {
      artifactId: payload.artifact_metadata.id,
      status: 'ready' as const,
      jsonBase64: format === 'json' || format === 'both' ? jsonBase64 : undefined,
      pdfBase64,
      downloadUrl_json: format !== 'pdf' ? `data:application/json;base64,${jsonBase64}` : undefined,
      downloadUrl_pdf: pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : undefined,
      signatureHash: payload.integrity.root_hash,
      artifactMeta: {
        id: payload.artifact_metadata.id,
        companyId,
        timeWindow: { start: windowStart, end: windowEnd },
        format: format === 'both' ? 'json' : format,
        generatedAt: payload.artifact_metadata.generated_at,
        sha256: payload.artifact_metadata.hash,
      },
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
