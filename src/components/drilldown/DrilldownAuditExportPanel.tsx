import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileJson, FileText, Loader2 } from 'lucide-react'
import { downloadAuditJSON, downloadAuditPDF } from '@/lib/audit-export'
import type { IPIViewContext } from '@/types/company-view'
import type { Movement } from '@/types/drilldown'
import type { NarrativeEvent } from '@/types/narrative'

interface DrilldownAuditExportPanelProps {
  movement: Movement | null
  events: NarrativeEvent[]
  companyId: string
  companyName?: string
  windowStart: string
  windowEnd: string
}

export function DrilldownAuditExportPanel({
  movement,
  events = [],
  companyId,
  companyName = '',
  windowStart,
  windowEnd,
}: DrilldownAuditExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const safeEvents = Array.isArray(events) ? events : []

  const viewContext: IPIViewContext = {
    companyId,
    companyName: companyName || companyId,
    windowStart,
    windowEnd,
    ipi: movement?.currentIPI,
    delta: movement?.contributionDelta ?? 0,
    direction:
      (movement?.contributionDelta ?? 0) > 0
        ? 'up'
        : (movement?.contributionDelta ?? 0) < 0
          ? 'down'
          : 'flat',
    breakdown: {
      narrative: 0.4,
      credibility: 0.4,
      risk: 0.2,
    },
    narratives: movement
      ? [
          {
            narrativeId: movement.movementId,
            name: movement.narrativeTitle,
            contribution: movement.contributionDelta,
          },
        ]
      : [],
    events: safeEvents,
  }

  const handleDownloadJSON = () => {
    setIsExporting(true)
    try {
      downloadAuditJSON(viewContext)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadPDF = () => {
    setIsExporting(true)
    try {
      downloadAuditPDF(viewContext)
    } finally {
      setIsExporting(false)
    }
  }

  const busy = isExporting

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
        <p className="text-xs text-muted-foreground">
          Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. Full
          methodology in About & Help.
        </p>
      </CardContent>
    </Card>
  )
}
