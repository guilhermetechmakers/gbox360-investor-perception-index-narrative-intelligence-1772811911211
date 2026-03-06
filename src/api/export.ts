/**
 * Audit Export API
 * POST /api/export/ipi-artifact — generates signed JSON/PDF artifacts
 * Invokes Supabase Edge Function when available, falls back to REST API
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  ExportIPIArtifactRequest,
  ExportIPIArtifactResponse,
  ExportIPIArtifactEdgeResponse,
} from '@/types/export'

function decodeBase64ToJson(b64: string | null | undefined): string | undefined {
  if (b64 == null || b64 === '') return undefined
  try {
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    return undefined
  }
}

function normalizeEdgeResponse(
  res: ExportIPIArtifactEdgeResponse & { artifactJson?: string }
): ExportIPIArtifactResponse {
  const artifactJson =
    res.artifactJson ?? (res.jsonBase64 ? decodeBase64ToJson(res.jsonBase64) : undefined)
  return {
    artifactId: res.artifactId,
    status: res.status,
    downloadUrl_json: res.downloadUrl_json,
    downloadUrl_pdf: res.downloadUrl_pdf,
    jsonBase64: res.jsonBase64,
    pdfBase64: res.pdfBase64,
    artifactJson,
    artifactPdfBase64: res.pdfBase64,
    signatureHash: res.signatureHash,
    artifactMeta: res.artifactMeta,
  }
}

export const exportApi = {
  /**
   * POST /api/export/ipi-artifact
   * Generates signed audit artifacts (JSON, PDF) for the given IPI view.
   * Returns artifactId, download URLs, and signature metadata.
   */
  postExportIPIArtifact: async (
    body: ExportIPIArtifactRequest
  ): Promise<ExportIPIArtifactResponse> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<
          ExportIPIArtifactEdgeResponse
        >('export-ipi-artifact', {
          body: {
            companyId: body.companyId,
            windowStart: body.windowStart,
            windowEnd: body.windowEnd,
            viewId: body.viewId,
            includeNarratives: body.includeNarratives ?? [],
            format: body.format ?? 'both',
          },
        })
        if (!error && data) {
          return normalizeEdgeResponse(data)
        }
      } catch {
        // Fall through to REST API
      }
    }
    const res = await api.post<
      ExportIPIArtifactResponse | ExportIPIArtifactEdgeResponse
    >('/api/export/ipi-artifact', body)
    const edge = res as ExportIPIArtifactEdgeResponse
    if (edge?.artifactId != null) {
      return normalizeEdgeResponse(edge)
    }
    return res as ExportIPIArtifactResponse
  },

  /**
   * GET /api/export/artifact/:artifactId
   * Retrieves artifact metadata and signed download URLs.
   */
  getArtifact: async (artifactId: string): Promise<ExportIPIArtifactResponse> =>
    api.get<ExportIPIArtifactResponse>(
      `/api/export/artifact/${encodeURIComponent(artifactId)}`
    ),
}
