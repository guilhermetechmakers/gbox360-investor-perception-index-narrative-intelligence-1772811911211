/** Audit Export & Artifact Generation types */

export interface IPIArtifactExportRequest {
  companyId: string
  windowStart: string
  windowEnd: string
  viewId?: string
  narrativeId?: string
  includeNarratives?: string[]
  format?: 'json' | 'pdf' | 'both'
}

export interface ArtifactMeta {
  id: string
  companyId: string
  narrativeId?: string
  timeWindow: { start: string; end: string }
  format: 'json' | 'pdf'
  generatedAt: string
  sha256: string
  signerId?: string
  retentionPolicy?: string
}

export interface IPIArtifactExportResponse {
  artifactId: string
  status: 'pending' | 'ready' | 'failed'
  downloadUrl_json?: string
  downloadUrl_pdf?: string
  signatureHash?: string
  artifactMeta?: ArtifactMeta
  message?: string
  /** Inline artifact JSON when returned by Edge Function */
  artifactJson?: string
}

export interface ArtifactDownloadInfo {
  artifactId: string
  url: string
  format: 'json' | 'pdf'
  artifactMeta: ArtifactMeta
}
