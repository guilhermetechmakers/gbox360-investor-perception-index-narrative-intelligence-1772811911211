import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditArtifactExporterButton } from '@/components/shared/AuditArtifactExporterButton'
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
  const safeEvents = Array.isArray(events) ? events : []

  const viewContext: IPIViewContext = useMemo(
    () => ({
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
    }),
    [movement, companyId, companyName, windowStart, windowEnd, safeEvents]
  )

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
          narrativeId={movement?.movementId}
          className="w-full gap-2 bg-[#0F172A] hover:bg-[#0F172A]/90 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-[#93C5FD]"
        />
        <p className="text-xs text-muted-foreground">
          Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. Full
          methodology in About & Help.
        </p>
      </CardContent>
    </Card>
  )
}
