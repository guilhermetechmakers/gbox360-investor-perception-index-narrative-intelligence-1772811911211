import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeContribution } from '@/types/narrative'

interface NarrativeContributionCardProps {
  narrative: NarrativeContribution
  weight?: number
  className?: string
}

export function NarrativeContributionCard({
  narrative,
  weight,
  className,
}: NarrativeContributionCardProps) {
  const safeSourceRefs = Array.isArray(narrative.sourceRefs) ? narrative.sourceRefs : []
  const contributionPct =
    typeof narrative.contribution === 'number'
      ? (narrative.contribution * 100).toFixed(1)
      : '—'

  return (
    <Card
      className={cn(
        'card-surface transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{narrative.label}</p>
              {weight != null && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Weight: {(weight * 100).toFixed(0)}%
                </p>
              )}
            </div>
            <Badge variant="accent" className="shrink-0 text-sm font-semibold">
              {contributionPct}%
            </Badge>
          </div>
          {safeSourceRefs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Source references
              </p>
              <ul className="space-y-1">
                {safeSourceRefs.slice(0, 3).map((ref, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground truncate"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate" title={ref}>
                      {ref}
                    </span>
                  </li>
                ))}
                {safeSourceRefs.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{safeSourceRefs.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
