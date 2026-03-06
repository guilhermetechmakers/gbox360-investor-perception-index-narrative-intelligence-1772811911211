/**
 * Audit Export API - IPI artifact generation and retrieval
 * Integrates with Supabase Edge Function export-ipi-artifact
 */

import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  IPIArtifactExportRequest,
  IPIArtifactExportResponse,
} from '@/types/audit-export'

export const auditExportApi = {
  /**
   * POST /api/export/ipI-artifact
   * Request signed artifact generation (JSON and/or PDF)
   */
  requestIPIArtifact: async (
    params: IPIArtifactExportRequest
  ): Promise<IPIArtifactExportResponse> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke<IPIArtifactExportResponse>(
          'export-ipi-artifact',
          {
            body: {
              companyId: params.companyId,
              windowStart: params.windowStart,
              windowEnd: params.windowEnd,
              viewId: params.viewId,
              narrativeId: params.narrativeId,
              includeNarratives: params.includeNarratives ?? [],
              format: params.format ?? 'both',
            },
          }
        )
        if (!error && data) return data
      } catch {
        // Fall through to REST API
      }
    }
    const res = await api.post<IPIArtifactExportResponse>(
      '/api/export/ipI-artifact',
      {
        companyId: params.companyId,
        windowStart: params.windowStart,
        windowEnd: params.windowEnd,
        viewId: params.viewId,
        narrativeId: params.narrativeId,
        includeNarratives: params.includeNarratives ?? [],
        format: params.format ?? 'both',
      }
    )
    return res
  },

  /**
   * GET /api/export/artifact/:artifactId
   * Retrieve artifact metadata
   */
  getArtifact: async (artifactId: string): Promise<IPIArtifactExportResponse | null> => {
    try {
      const res = await api.get<IPIArtifactExportResponse>(
        `/api/export/artifact/${encodeURIComponent(artifactId)}`
      )
      return res ?? null
    } catch {
      return null
    }
  },
}
