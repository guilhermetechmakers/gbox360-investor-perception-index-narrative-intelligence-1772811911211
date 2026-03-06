import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileJson, FileText, Loader2 } from 'lucide-react'
import { downloadAuditJSON, downloadAuditPDF } from '@/lib/audit-export'
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

  const handleDownloadJSON = () => {
    setIsExporting(true)
    try {
      downloadAuditJSON(viewContext)
      onExport?.()
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadPDF = () => {
    setIsExporting(true)
    try {
      downloadAuditPDF(viewContext)
      onExport?.()
    } finally {
      setIsExporting(false)
    }
  }

  const busy = isExporting || status === 'exporting'

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-xl">Audit Export</CardTitle>
        <p className="text-sm text-muted-foreground">
          Download signed artifacts with calculation inputs and provenance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJSON}
            disabled={busy}
            className="gap-2"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4" />
            )}
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={busy}
            className="gap-2"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
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
