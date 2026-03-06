import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy, ExternalLink, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { NarrativeEventWithTopics, TopicLabel } from '@/types/topic-persistence'
import { ensureArray } from '@/lib/runtime-safe'

const TOPIC_COLORS: Record<string, string> = {
  earnings: 'bg-emerald-500/20 text-emerald-700 border-emerald-200',
  governance: 'bg-blue-500/20 text-blue-700 border-blue-200',
  innovation: 'bg-violet-500/20 text-violet-700 border-violet-200',
  market: 'bg-amber-500/20 text-amber-700 border-amber-200',
  risk: 'bg-red-500/20 text-red-700 border-red-200',
  sustainability: 'bg-teal-500/20 text-teal-700 border-teal-200',
  unknown: 'bg-muted text-muted-foreground border-border',
}

function getTopicStyle(topic: string): string {
  return TOPIC_COLORS[topic.toLowerCase()] ?? TOPIC_COLORS.unknown
}

interface NarrativeDetailDrawerProps {
  narrativeId: string | null
  narrative: NarrativeEventWithTopics | null | undefined
  isLoading?: boolean
  onClose: () => void
  onDrilldown?: (narrativeId: string) => void
}

export function NarrativeDetailDrawer({
  narrativeId,
  narrative,
  isLoading,
  onClose,
  onDrilldown,
}: NarrativeDetailDrawerProps) {
  const open = !!narrativeId

  const handleCopyPayload = () => {
    if (!narrative) return
    const payload = JSON.stringify(
      { text: narrative.text, metadata: narrative.raw_payload, topic_labels: narrative.topic_labels },
      null,
      2
    )
    navigator.clipboard.writeText(payload).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  const topicLabels = ensureArray(narrative?.topic_labels) as TopicLabel[]
  const primaryTopic = narrative?.primary_topic ?? 'unknown'
  const explanation = narrative?.explanation ?? ''

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        aria-describedby="narrative-detail-description"
      >
        <SheetHeader>
          <SheetTitle>Narrative Details</SheetTitle>
          <SheetDescription id="narrative-detail-description">
            Classification, provenance, and raw payload
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!isLoading && narrative && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Primary Topic</h3>
              <Badge className={cn('text-sm font-medium border', getTopicStyle(primaryTopic))}>
                {primaryTopic}
              </Badge>
            </div>

            {topicLabels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Topic Labels</h3>
                <div className="flex flex-wrap gap-1.5">
                  {topicLabels.map((t) => (
                    <Badge
                      key={t.topic}
                      variant="outline"
                      className={cn('text-xs font-medium border', getTopicStyle(t.topic))}
                    >
                      {t.topic} {(t.confidence * 100).toFixed(0)}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {explanation && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Classification Rationale</h3>
                <p className="text-sm text-foreground">{explanation}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Metadata</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Source:</span> {narrative.source}
                </p>
                <p>
                  <span className="text-muted-foreground">Platform:</span> {narrative.platform}
                </p>
                <p>
                  <span className="text-muted-foreground">Audience:</span> {narrative.audience_class}
                </p>
                <p>
                  <span className="text-muted-foreground">Timestamp:</span> {narrative.timestamp}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Raw Text</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm max-h-40 overflow-y-auto">
                {narrative.text || (
                  <span className="text-muted-foreground italic">No text</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPayload}
                className="gap-2"
                aria-label="Copy payload to clipboard"
              >
                <Copy className="h-4 w-4" />
                Copy payload
              </Button>
              {onDrilldown && (
                <Button
                  size="sm"
                  onClick={() => onDrilldown(narrative.id ?? narrative.event_id ?? '')}
                  className="gap-2"
                  aria-label="View events drilldown"
                >
                  <ExternalLink className="h-4 w-4" />
                  View events
                </Button>
              )}
            </div>
          </div>
        )}

        {!isLoading && !narrative && open && (
          <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Narrative not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
