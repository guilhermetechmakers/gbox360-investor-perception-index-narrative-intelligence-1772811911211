import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  NarrativeEventWithTopics,
  TopicAggregate,
  TopicLabel,
} from '@/types/topic-classification'
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
  const key = topic.toLowerCase()
  return TOPIC_COLORS[key] ?? TOPIC_COLORS.unknown
}

/** Minimum narrative shape for card display (API returns id, event_id, text, topic_labels, etc.) */
type NarrativeCardNarrative = Pick<
  NarrativeEventWithTopics,
  'event_id' | 'source' | 'audience_class'
> & { id?: string; text?: string; raw_text?: string; topic_labels?: TopicLabel[]; primary_topic?: string }

/** Narrative variant: single narrative event with topic labels */
interface NarrativeCardNarrativeProps {
  narrative: NarrativeCardNarrative
  variant?: 'narrative'
  aggregate?: never
  companyId?: string
  windowStart?: string
  windowEnd?: string
  onSelect?: (id: string) => void
  onViewDetail?: (id: string) => void
  className?: string
}

/** Aggregate variant: per-topic persistence summary */
interface NarrativeCardAggregateProps {
  aggregate: TopicAggregate
  variant: 'aggregate'
  narrative?: never
  companyId?: string
  windowStart?: string
  windowEnd?: string
  onSelect?: (id: string) => void
  onViewDetail?: (id: string) => void
  className?: string
}

export type NarrativeCardProps = NarrativeCardNarrativeProps | NarrativeCardAggregateProps

export function NarrativeCard(props: NarrativeCardProps) {
  const {
    onSelect,
    onViewDetail,
    className,
  } = props

  const handleAction = onViewDetail ?? onSelect

  if (props.variant === 'aggregate' && props.aggregate) {
    const agg = props.aggregate
    const topEvents = ensureArray(agg.top_contributing_events)
    return (
      <Card
        className={cn(
          'card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-foreground truncate">{agg.topic_label ?? 'Topic'}</p>
            <Badge variant="secondary" className="shrink-0 text-sm font-semibold">
              {(typeof agg.persistence_score === 'number' ? agg.persistence_score : 0).toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Authority-weighted count: {(typeof agg.authority_weighted_count === 'number' ? agg.authority_weighted_count : 0).toFixed(1)}
          </p>
          {topEvents.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Top contributing events</p>
              <ul className="space-y-1">
                {topEvents.slice(0, 3).map((ev, i) => (
                  <li key={i} className="text-xs text-muted-foreground truncate" title={ev.snippet}>
                    {ev.snippet ? `${ev.snippet.slice(0, 60)}…` : ev.source}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const narrative = props.narrative
  if (!narrative) return null

  const topicLabels = ensureArray(narrative.topic_labels) as TopicLabel[]
  const primaryTopic = narrative.primary_topic ?? 'unknown'
  const text = (narrative as { text?: string; raw_text?: string }).text ?? (narrative as { raw_text?: string }).raw_text ?? ''
  const snippet = text.length > 120 ? `${text.slice(0, 120)}…` : text
  const source = narrative.source ?? 'unknown'
  const audienceClass = narrative.audience_class ?? 'unknown'
  const narrativeId = narrative.id ?? narrative.event_id ?? ''

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      onClick={() => handleAction?.(narrativeId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAction?.(narrativeId)
        }
      }}
      aria-label={`View narrative: ${primaryTopic}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{primaryTopic}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {source} · {audienceClass}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label="View details"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {snippet ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="text-sm">No preview</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {topicLabels.slice(0, 3).map((t) => (
            <Badge
              key={t.topic}
              variant="outline"
              className={cn('text-xs font-medium border', getTopicStyle(t.topic))}
            >
              {t.topic} {((t.confidence ?? 0) * 100).toFixed(0)}%
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
