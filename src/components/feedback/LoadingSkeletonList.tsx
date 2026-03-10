import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/profile/EmptyState'
import { cn } from '@/lib/utils'
import { ListChecks, AlertCircle } from 'lucide-react'

export interface LoadingSkeletonListProps<T = unknown> {
  /** Array of items - when loading, skeleton count matches length; when loaded, items are rendered */
  items: T[] | null | undefined
  /** Function to render each item when data is available */
  itemRenderer: (item: T, index: number) => React.ReactNode
  /** When true, always show skeletons regardless of items */
  isLoading?: boolean
  /** Number of skeleton rows when items is empty/undefined during loading */
  fallbackSkeletonCount?: number
  /** Optional wrapper class for the list container */
  className?: string
  /** Optional class for each skeleton row */
  skeletonClassName?: string
  /** Title for empty state when items are empty and not loading */
  emptyTitle?: string
  /** Description for empty state */
  emptyDescription?: string
  /** Optional CTA (e.g. Button) for empty state */
  emptyAction?: React.ReactNode
  /** When set, show error state instead of list or empty state */
  error?: string | null
  /** Optional retry callback for error state */
  onRetry?: () => void
}

function ListSkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card transition-shadow duration-200',
        className
      )}
      aria-hidden
    >
      <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4 max-w-[75%] bg-muted" />
        <Skeleton className="h-3 w-1/2 max-w-[50%] bg-muted" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0 bg-muted" />
    </div>
  )
}

export function LoadingSkeletonList<T>({
  items,
  itemRenderer,
  isLoading = false,
  fallbackSkeletonCount = 5,
  className,
  skeletonClassName,
  emptyTitle = 'No items yet',
  emptyDescription,
  emptyAction,
  error,
  onRetry,
}: LoadingSkeletonListProps<T>) {
  const safeItems = Array.isArray(items) ? items : []
  const skeletonCount =
    safeItems.length > 0 ? safeItems.length : Math.min(Math.max(fallbackSkeletonCount, 1), 20)
  const isEmpty = safeItems.length === 0 && !isLoading && !error
  const hasError = error != null && error !== ''

  if (isLoading) {
    return (
      <div
        className={cn('space-y-3', className)}
        role="status"
        aria-busy="true"
        aria-label="Loading list"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ListSkeletonRow key={i} className={skeletonClassName} />
        ))}
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card py-12 px-4 shadow-card',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <EmptyState
          icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
          title="Something went wrong"
          description={error}
          action={
            onRetry ? (
              <Button
                type="button"
                variant="default"
                onClick={onRetry}
                className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Try again"
              >
                Try again
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card py-12 px-4 shadow-card transition-shadow duration-200',
          className
        )}
        role="status"
        aria-label="List is empty"
      >
        <EmptyState
          icon={<ListChecks className="h-6 w-6 text-muted-foreground" aria-hidden />}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {(safeItems ?? []).map((item, index) => (
        <div key={index}>{itemRenderer(item, index)}</div>
      ))}
    </div>
  )
}
