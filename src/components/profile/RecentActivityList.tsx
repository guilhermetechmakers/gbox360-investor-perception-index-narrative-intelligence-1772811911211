import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import {
  Activity,
  FileDown,
  BarChart3,
  Building2,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfileActivityItem } from '@/types/profile'
import { EmptyState } from './EmptyState'

export interface RecentActivityListProps {
  activity: ProfileActivityItem[]
  isLoading?: boolean
}

function getActivityIcon(type: ProfileActivityItem['type']) {
  switch (type) {
    case 'export':
      return FileDown
    case 'admin_action':
      return Shield
    case 'drilldown':
      return ChevronRight
    case 'company_view':
      return Building2
    case 'check':
    default:
      return BarChart3
  }
}

export function RecentActivityList({
  activity,
  isLoading = false,
}: RecentActivityListProps) {
  const items = Array.isArray(activity) ? activity : []

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-accent" />
          Recent activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your recent checks, exports, and actions
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-6 w-6" />}
            title="No recent activity"
            description="Perform company checks, exports, or drilldowns to see your activity here."
            action={
              <a
                href="/dashboard"
                className="text-sm font-medium text-accent hover:underline"
              >
                Go to dashboard
              </a>
            }
          />
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {(items ?? []).map((item) => {
                const Icon = getActivityIcon(item.type)
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5',
                      'transition-colors duration-150 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
