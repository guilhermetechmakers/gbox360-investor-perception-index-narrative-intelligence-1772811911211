import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditArtifactExporterButton } from '@/components/shared/AuditArtifactExporterButton'
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
  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl">Audit Export</CardTitle>
        <p className="text-sm text-muted-foreground">
          Download signed artifacts with calculation inputs and provenance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuditArtifactExporterButton
          viewContext={viewContext}
          variant="default"
          size="lg"
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onSuccess={() => onExport?.()}
        />
        {status === 'ready' && (
          <p className="text-xs text-success">
            Signed artifact available. Both formats include raw payload references and
            calculation inputs.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. Full
          methodology in About & Help.
        </p>
      </CardContent>
    </Card>
  )
}
