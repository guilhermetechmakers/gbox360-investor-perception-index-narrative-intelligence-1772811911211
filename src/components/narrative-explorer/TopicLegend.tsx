import { cn } from '@/lib/utils'

const TOPIC_ITEMS: { key: string; label: string; color: string }[] = [
  { key: 'earnings', label: 'Earnings', color: 'bg-emerald-500' },
  { key: 'governance', label: 'Governance', color: 'bg-blue-500' },
  { key: 'innovation', label: 'Innovation', color: 'bg-violet-500' },
  { key: 'market', label: 'Market', color: 'bg-amber-500' },
  { key: 'risk', label: 'Risk', color: 'bg-red-500' },
  { key: 'sustainability', label: 'Sustainability', color: 'bg-teal-500' },
  { key: 'unknown', label: 'Other', color: 'bg-muted-foreground' },
]

interface TopicLegendProps {
  activeTopics?: string[]
  onTopicClick?: (topic: string) => void
  className?: string
}

export function TopicLegend({ activeTopics = [], onTopicClick, className }: TopicLegendProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="list"
      aria-label="Topic legend"
    >
      {TOPIC_ITEMS.map((item) => {
        const isActive = activeTopics.length === 0 || activeTopics.includes(item.key)
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onTopicClick?.(item.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
              'border border-border hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isActive ? 'opacity-100' : 'opacity-40'
            )}
            aria-pressed={isActive}
            aria-label={`Topic: ${item.label}`}
          >
            <span className={cn('h-2 w-2 rounded-full shrink-0', item.color)} aria-hidden />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
