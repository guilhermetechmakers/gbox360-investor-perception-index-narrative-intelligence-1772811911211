import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditArtifactExporterButton } from '@/components/shared/AuditArtifactExporterButton'
import { Loader2, AlertCircle, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { IPIViewContext } from '@/types/company-view'

type ExportStatus = 'idle' | 'exporting' | 'ready'

interface AuditExportPanelProps {
  viewContext: IPIViewContext
  onExport?: () => void
  status?: ExportStatus
}

export function AuditExportPanel({
  viewContext,
  onExport,
  status = 'idle',
}: AuditExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<Error | null>(null)

  const handleExportingChange = useCallback((exporting: boolean) => {
    setIsExporting(exporting)
    if (exporting) setExportError(null)
  }, [])

  const handleSuccess = useCallback(() => {
    setExportError(null)
    toast.success('Audit artifact export completed. Signed artifacts include raw payload references and calculation inputs.')
    onExport?.()
  }, [onExport])

  const handleError = useCallback((error: Error) => {
    setExportError(error)
  }, [])

  const canExport = Boolean(viewContext?.companyId && viewContext?.windowStart && viewContext?.windowEnd)

  return (
    <Card
      className={cn(
        'card-surface relative transition-all duration-200',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}
      aria-label="Audit export"
      aria-busy={isExporting}
      aria-labelledby="audit-export-title"
      role="region"
    >
      {isExporting && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px] bg-card/80 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 text-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <span className="text-sm font-medium">Preparing export…</span>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle id="audit-export-title" className="text-xl">
          Audit Export
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Download signed artifacts with calculation inputs and provenance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canExport ? (
          <div
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/50 p-6 text-center"
            role="status"
            aria-label="Export not available"
          >
            <FileDown className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Select a company and time window to export audit artifacts.
            </p>
          </div>
        ) : (
          <>
            <AuditArtifactExporterButton
              viewContext={viewContext}
              variant="default"
              size="lg"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onSuccess={handleSuccess}
              onError={handleError}
              onExportingChange={handleExportingChange}
            />
            {exportError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-border bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{exportError.message}</span>
              </div>
            )}
            {status === 'ready' && !exportError && (
              <p className="text-xs text-success">
                Signed artifact available. Both formats include raw payload references and
                calculation inputs.
              </p>
            )}
          </>
        )}
        <p className="text-xs text-muted-foreground">
          Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. Full
          methodology in About & Help.
        </p>
      </CardContent>
    </Card>
  )
}
