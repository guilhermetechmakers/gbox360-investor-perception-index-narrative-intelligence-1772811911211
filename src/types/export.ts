/** Audit Export & Artifact Generation types */

export interface ExportIPIArtifactRequest {
  companyId: string
  windowStart: string
  windowEnd: string
  viewId?: string
  includeNarratives?: string[]
  format?: 'json' | 'pdf' | 'both'
}

export interface ExportIPIArtifactResponse {
  artifactId: string
  status: 'ready' | 'pending' | 'failed'
  downloadUrl_json?: string
  downloadUrl_pdf?: string
  jsonBase64?: string
  pdfBase64?: string
  /** Decoded JSON string for client download */
  artifactJson?: string
  /** Base64 PDF for client download */
  artifactPdfBase64?: string
  signatureHash?: string
  artifactMeta?: ArtifactMeta
}

export interface ArtifactMeta {
  id: string
  companyId: string
  narrativeId?: string
  timeWindow: { start: string; end: string }
  format: 'json' | 'pdf'
  generatedAt: string
  sha256: string
}

export interface ExportIPIArtifactEdgeResponse {
  artifactId: string
  status: 'ready' | 'pending' | 'failed'
  downloadUrl_json?: string
  downloadUrl_pdf?: string
  jsonBase64?: string
  pdfBase64?: string
  signatureHash?: string
  artifactMeta?: ArtifactMeta
}
