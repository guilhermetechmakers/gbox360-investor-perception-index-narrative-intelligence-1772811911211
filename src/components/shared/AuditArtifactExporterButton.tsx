'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FileJson, FileText, Loader2, Download } from 'lucide-react'
import { useExportIPIArtifact } from '@/hooks/useIPI'
import { downloadAuditJSON, downloadAuditPDF } from '@/lib/audit-export'
import { ensureArray } from '@/lib/runtime-safe'
import { toast } from 'sonner'
import { PDFPreviewOrDownloadRow } from '@/components/shared/PDFPreviewOrDownloadRow'
import type { IPIViewContext } from '@/types/company-view'
import type { ExportIPIArtifactResponse } from '@/types/export'

type ExportFormat = 'json' | 'pdf' | 'both'

interface AuditArtifactExporterButtonProps {
  viewContext: IPIViewContext
  narrativeId?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'accent'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
  onSuccess?: (result: ExportIPIArtifactResponse) => void
  onError?: (error: Error) => void
  onExportingChange?: (exporting: boolean) => void
}

export function AuditArtifactExporterButton({
  viewContext,
  narrativeId,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  onSuccess,
  onError,
  onExportingChange,
}: AuditArtifactExporterButtonProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('both')
  const [selectedNarrativeIds, setSelectedNarrativeIds] = useState<Set<string>>(
    () => new Set(ensureArray(viewContext.narratives).slice(0, 3).map((n) => n.narrativeId).filter(Boolean) as string[])
  )
  const [lastResult, setLastResult] = useState<ExportIPIArtifactResponse | null>(null)

  const narratives = useMemo(() => ensureArray(viewContext.narratives), [viewContext.narratives])
  const narrativeIds = useMemo(
    () => narratives.map((n) => n.narrativeId).filter(Boolean) as string[],
    [narratives]
  )

  const exportMutation = useExportIPIArtifact()

  const handleExport = useCallback(async () => {
    const { companyId, windowStart, windowEnd } = viewContext
    if (!companyId || !windowStart || !windowEnd) {
      const err = new Error('Missing company or time window')
      toast.error(err.message)
      onError?.(err)
      return
    }

    const includeNarratives =
      selectedNarrativeIds.size > 0
        ? Array.from(selectedNarrativeIds)
        : narrativeIds.length > 0
          ? narrativeIds.slice(0, 3)
          : narrativeId
            ? [narrativeId]
            : undefined

    try {
      const result = (await exportMutation.mutateAsync({
        companyId,
        windowStart,
        windowEnd,
        viewId: `view-${companyId}-${Date.now()}`,
        narrativeId: narrativeId ?? undefined,
        includeNarratives,
        format,
      })) as ExportIPIArtifactResponse

      setLastResult(result)
      onSuccess?.(result)
      toast.success('Export ready')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Export failed')
      onError?.(error)
      // Fallback to client-side generation when Supabase/API unavailable
      try {
        if (format === 'json' || format === 'both') {
          downloadAuditJSON(viewContext)
        }
        if (format === 'pdf' || format === 'both') {
          downloadAuditPDF(viewContext)
        }
        toast.success('Artifacts downloaded (client-generated)')
        setOpen(false)
      } catch (fallbackErr) {
        const error = fallbackErr instanceof Error ? fallbackErr : new Error('Export failed')
        onError?.(error)
        toast.error(fallbackErr instanceof Error ? fallbackErr.message : 'Export failed')
      }
    }
  }, [viewContext, format, exportMutation, selectedNarrativeIds, narrativeIds, narrativeId, onSuccess, onError])

  const toggleNarrative = useCallback((id: string) => {
    setSelectedNarrativeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllNarratives = useCallback(() => {
    setSelectedNarrativeIds(new Set(narrativeIds))
  }, [narrativeIds])

  const selectNoNarratives = useCallback(() => {
    setSelectedNarrativeIds(new Set())
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setLastResult(null)
  }, [])

  const isExporting = exportMutation.isPending
  const isReady = !!lastResult && lastResult.status === 'ready'

  useEffect(() => {
    onExportingChange?.(isExporting)
  }, [isExporting, onExportingChange])

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Export audit artifacts"
      >
        {children ?? (
          <>
            <Download className="h-4 w-4" />
            Export Audit Artifacts
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md" aria-describedby="export-dialog-desc">
          <DialogHeader>
            <DialogTitle>Export Audit Artifacts</DialogTitle>
            <DialogDescription id="export-dialog-desc">
              Generate signed JSON and/or PDF artifacts with calculation inputs, provenance, and
              integrity hashes. Select format and confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isReady ? (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Format</p>
                  <div className="flex flex-wrap gap-2">
                    {(['json', 'pdf', 'both'] as const).map((f) => (
                      <Button
                        key={f}
                        variant={format === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormat(f)}
                        className="gap-2"
                        aria-label={f === 'json' ? 'Export as JSON' : f === 'pdf' ? 'Export as PDF' : 'Export as JSON and PDF'}
                        aria-pressed={format === f}
                      >
                        {f === 'json' && <FileJson className="h-4 w-4" />}
                        {f === 'pdf' && <FileText className="h-4 w-4" />}
                        {f === 'both' && (
                          <>
                            <FileJson className="h-4 w-4" />
                            <FileText className="h-4 w-4" />
                          </>
                        )}
                        {f === 'json' ? 'JSON' : f === 'pdf' ? 'PDF' : 'Both'}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Window: {viewContext.windowStart} – {viewContext.windowEnd}
                </p>
                {narrativeIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Narrative scope</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={selectAllNarratives}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={selectNoNarratives}
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-28 overflow-y-auto rounded-md border border-border p-2 space-y-1.5">
                      {narrativeIds.map((id) => {
                        const n = narratives.find((x) => x.narrativeId === id)
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <Checkbox
                              checked={selectedNarrativeIds.has(id)}
                              onCheckedChange={() => toggleNarrative(id)}
                              aria-label={`Include ${n?.name ?? id}`}
                            />
                            <span className="truncate">{n?.name ?? id}</span>
                          </label>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty for top 3 narratives
                    </p>
                  </div>
                )}
              </>
            ) : lastResult ? (
              <PDFPreviewOrDownloadRow
                artifactMeta={
                  lastResult.artifactMeta ?? {
                    id: lastResult.artifactId,
                    companyId: viewContext.companyId,
                    timeWindow: {
                      start: viewContext.windowStart,
                      end: viewContext.windowEnd,
                    },
                    format: 'json',
                    generatedAt: new Date().toISOString(),
                    sha256: lastResult.signatureHash ?? '',
                  }
                }
                artifactJson={lastResult.artifactJson}
                artifactPdfBase64={lastResult.artifactPdfBase64}
              />
            ) : null}
          </div>
          <DialogFooter>
            {!isReady ? (
              <>
                <Button variant="outline" onClick={handleClose} aria-label="Cancel export and close dialog">
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label={isExporting ? 'Export in progress' : 'Start export'}
                  aria-busy={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} aria-label="Close dialog">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
