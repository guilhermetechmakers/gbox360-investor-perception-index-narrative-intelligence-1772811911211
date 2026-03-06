import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEventWithTopics, TopicLabel } from '@/types/topic-persistence'
import { ensureArray } from '@/lib/runtime-safe'

interface NarrativeCardProps {
  narrative: NarrativeEventWithTopics
  onSelect?: (id: string) => void
  className?: string
}

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

export function NarrativeCard({ narrative, onSelect, className }: NarrativeCardProps) {
  const topicLabels = ensureArray(narrative?.topic_labels) as TopicLabel[]
  const primaryTopic = narrative?.primary_topic ?? 'unknown'
  const text = narrative?.text ?? ''
  const snippet = text.length > 120 ? `${text.slice(0, 120)}…` : text
  const source = narrative?.source ?? 'unknown'
  const audienceClass = narrative?.audience_class ?? 'unknown'

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      onClick={() => onSelect?.(narrative?.id ?? narrative?.event_id ?? '')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(narrative?.id ?? narrative?.event_id ?? '')
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
              {t.topic} {(t.confidence * 100).toFixed(0)}%
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
