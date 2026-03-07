import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/profile/EmptyState'
import { ArrowRight, MapPin } from 'lucide-react'
import type { RoadmapItem } from '@/types/about-help'
import { cn } from '@/lib/utils'

const ROADMAP_ITEMS: RoadmapItem[] = [
  { id: 'r1', title: 'Additional data sources (Reuters, Bloomberg)', status: 'planned' },
  { id: 'r2', title: 'Real-time narrative alerts', status: 'beta' },
  { id: 'r3', title: 'Custom weight scenarios (saved)', status: 'planned' },
  { id: 'r4', title: 'API access for programmatic IPI retrieval', status: 'alpha' },
  { id: 'r5', title: 'Multi-company comparison views', status: 'planned' },
]

const statusStyles: Record<string, string> = {
  alpha: 'bg-accent/10 text-accent',
  beta: 'bg-success/10 text-success',
  planned: 'bg-muted text-muted-foreground',
}

export function RoadmapTeaserBlock() {
  const items = ROADMAP_ITEMS ?? []
  const safeItems = Array.isArray(items) ? items : []
  const hasItems = safeItems.length > 0

  return (
    <SectionCard
      id="roadmap"
      title="Roadmap"
      meta="Upcoming features and enhancements"
    >
      {hasItems ? (
        <ul className="space-y-4" role="list">
          {safeItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span className="flex-1 text-foreground">{item.title}</span>
              {item.status && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    statusStyles[item.status] ?? statusStyles.planned
                  )}
                >
                  {item.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<MapPin className="h-6 w-6 text-muted-foreground" aria-hidden />}
          title="No roadmap items yet"
          description="Planned features and enhancements will appear here. Check back later or explore the rest of the product."
          className="py-8 text-left"
        />
      )}
      <div className="mt-6">
        <Button variant="outline" asChild size="sm" className="transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Link to="/">
            <span>Learn more</span>
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </SectionCard>
  )
}
