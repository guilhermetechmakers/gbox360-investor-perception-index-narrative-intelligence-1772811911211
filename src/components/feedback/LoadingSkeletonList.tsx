import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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
}

function ListSkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card p-4',
        className
      )}
      aria-hidden
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
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
}: LoadingSkeletonListProps<T>) {
  const safeItems = Array.isArray(items) ? items : []
  const skeletonCount =
    safeItems.length > 0 ? safeItems.length : Math.min(Math.max(fallbackSkeletonCount, 1), 20)

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

  return (
    <div className={cn('space-y-3', className)}>
      {(safeItems ?? []).map((item, index) => (
        <div key={index}>{itemRenderer(item, index)}</div>
      ))}
    </div>
  )
}
