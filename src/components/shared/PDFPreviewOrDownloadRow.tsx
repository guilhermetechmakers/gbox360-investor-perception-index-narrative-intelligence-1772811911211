'use client'

import { Button } from '@/components/ui/button'
import { FileJson, FileText, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArtifactMeta } from '@/types/export'

interface PDFPreviewOrDownloadRowProps {
  artifactMeta: ArtifactMeta
  onDownloadJson?: (content: string) => void
  onDownloadPdf?: (base64: string, filename: string) => void
  artifactJson?: string
  artifactPdfBase64?: string
  className?: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function PDFPreviewOrDownloadRow({
  artifactMeta,
  onDownloadJson,
  onDownloadPdf,
  artifactJson,
  artifactPdfBase64,
  className,
}: PDFPreviewOrDownloadRowProps) {
  const handleDownloadJson = () => {
    if (artifactJson) {
      if (onDownloadJson) {
        onDownloadJson(artifactJson)
      } else {
        const blob = new Blob([artifactJson], { type: 'application/json' })
        downloadBlob(
          blob,
          `gbox360-audit-${artifactMeta.companyId}-${artifactMeta.timeWindow.start}-${artifactMeta.timeWindow.end}.json`
        )
      }
    }
  }

  const handleDownloadPdf = () => {
    if (artifactPdfBase64) {
      try {
        const binary = atob(artifactPdfBase64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const filename = `gbox360-audit-${artifactMeta.companyId}-${artifactMeta.timeWindow.start}-${artifactMeta.timeWindow.end}.pdf`
        if (onDownloadPdf) {
          onDownloadPdf(artifactPdfBase64, filename)
        } else {
          downloadBlob(blob, filename)
        }
      } catch {
        // ignore
      }
    }
  }

  const hasJson = !!artifactJson
  const hasPdf = !!artifactPdfBase64

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      role="row"
      aria-label={`Artifact ${artifactMeta.id}`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">
            {artifactMeta.companyId} · {artifactMeta.timeWindow.start} – {artifactMeta.timeWindow.end}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generated {artifactMeta.generatedAt ? new Date(artifactMeta.generatedAt).toLocaleString() : '—'}
            {artifactMeta.sha256 && (
              <> · Hash: {artifactMeta.sha256.slice(0, 16)}…</>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {hasJson && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
        )}
        {hasPdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        )}
      </div>
    </div>
  )
}
