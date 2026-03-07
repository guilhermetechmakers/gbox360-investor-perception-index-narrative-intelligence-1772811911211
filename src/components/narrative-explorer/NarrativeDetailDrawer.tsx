import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy, ExternalLink, FileText, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { NarrativeEventWithTopics, TopicLabel } from '@/types/topic-classification'
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
  error?: Error | null
  onRetry?: () => void
  onClose: () => void
  onDrilldown?: (narrativeId: string) => void
}

export function NarrativeDetailDrawer({
  narrativeId,
  narrative,
  isLoading,
  error,
  onRetry,
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-border"
        aria-describedby="narrative-detail-description"
        aria-labelledby="narrative-detail-title"
      >
        <DialogHeader>
          <DialogTitle id="narrative-detail-title">Narrative Details</DialogTitle>
          <DialogDescription id="narrative-detail-description">
            Classification, provenance, and raw payload
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-6 mt-6" role="status" aria-label="Loading narrative details" aria-busy>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md bg-muted" />
              <Skeleton className="h-8 w-32 rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-md bg-muted" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                <Skeleton className="h-6 w-24 rounded-full bg-muted" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md bg-muted" />
              <Skeleton className="h-16 w-full rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded-md bg-muted" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full max-w-[200px] rounded bg-muted" />
                <Skeleton className="h-4 w-full max-w-[180px] rounded bg-muted" />
                <Skeleton className="h-4 w-full max-w-[160px] rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md bg-muted" />
              <Skeleton className="h-24 w-full rounded-lg bg-muted" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-9 w-28 rounded-md bg-muted" />
              <Skeleton className="h-9 w-24 rounded-md bg-muted" />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div
            className="mt-6 flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-border bg-muted/30"
            role="alert"
            aria-live="assertive"
            aria-label="Error loading narrative"
          >
            <AlertCircle className="h-12 w-12 text-destructive mb-4 shrink-0" aria-hidden />
            <p className="text-sm font-medium text-foreground mb-1">Could not load narrative</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error?.message ?? 'An error occurred.'}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2 min-h-[44px] focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Retry loading narrative"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            )}
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
                      {t.topic} {((t.confidence ?? 0) * 100).toFixed(0)}%
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
                  <span className="text-muted-foreground">Source:</span> {narrative.source ?? 'unknown'}
                </p>
                <p>
                  <span className="text-muted-foreground">Platform:</span> {narrative.platform ?? 'unknown'}
                </p>
                <p>
                  <span className="text-muted-foreground">Audience:</span> {narrative.audience_class ?? 'unknown'}
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

        {!isLoading && !narrative && !error && open && (
          <div
            className="mt-6 flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-muted/30"
            role="status"
            aria-label="Narrative not found"
          >
            <FileText className="h-12 w-12 text-muted-foreground mb-4 shrink-0" aria-hidden />
            <p className="text-muted-foreground text-sm">Narrative not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
