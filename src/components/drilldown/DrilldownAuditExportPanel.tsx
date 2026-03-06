import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditArtifactExporterButton } from '@/components/shared/AuditArtifactExporterButton'
import { EmptyState } from '@/components/profile/EmptyState'
import { FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'
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

const CARD_TITLE_ID = 'drilldown-audit-export-panel-title'

export function DrilldownAuditExportPanel({
  movement,
  events = [],
  companyId,
  companyName = '',
  windowStart,
  windowEnd,
}: DrilldownAuditExportPanelProps) {
  const safeEvents = Array.isArray(events) ? events : []
  const hasEvents = safeEvents.length > 0

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
    <Card
      className="card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
      aria-labelledby={CARD_TITLE_ID}
      aria-describedby="drilldown-audit-export-desc"
    >
      <CardHeader>
        <CardTitle id={CARD_TITLE_ID} className="text-xl">
          Audit Export
        </CardTitle>
        <p id="drilldown-audit-export-desc" className="text-sm text-muted-foreground">
          Download signed artifacts with calculation inputs and provenance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasEvents ? (
          <>
            <AuditArtifactExporterButton
              viewContext={viewContext}
              variant="default"
              size="lg"
              narrativeId={movement?.movementId}
              className={cn(
                'w-full gap-2 bg-primary hover:bg-primary/90',
                'transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            />
            <p className="text-xs text-muted-foreground">
              Provisional weights: Narrative 40%, Credibility 40%, Risk 20%. Full
              methodology in About & Help.
            </p>
          </>
        ) : (
          <>
            <EmptyState
              icon={<FileSpreadsheet className="h-6 w-6 text-muted-foreground" />}
              title="No events to include in audit"
              description="There are no narrative events in this window. You can still export context and time window; the artifact will not include event-level provenance."
              className="py-8 px-4 rounded-lg border border-border bg-muted/30"
            />
            <AuditArtifactExporterButton
              viewContext={viewContext}
              variant="default"
              size="lg"
              narrativeId={movement?.movementId}
              className={cn(
                'w-full gap-2 bg-primary hover:bg-primary/90',
                'transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            />
            <p className="text-xs text-muted-foreground">
              Export will include company and window metadata only. Provisional
              weights: Narrative 40%, Credibility 40%, Risk 20%.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
