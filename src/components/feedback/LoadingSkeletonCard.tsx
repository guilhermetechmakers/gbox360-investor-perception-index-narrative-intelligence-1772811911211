import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type SkeletonSize = 'sm' | 'md' | 'lg'

const SIZE_VARIANTS: Record<SkeletonSize, { height: string; count: number }> = {
  sm: { height: 'h-32', count: 2 },
  md: { height: 'h-48', count: 3 },
  lg: { height: 'h-64', count: 4 },
}

export interface LoadingSkeletonCardProps {
  /** When true, renders skeleton placeholders; when false, renders children */
  isLoading: boolean
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number
  /** Size variant affecting card height and internal structure */
  size?: SkeletonSize
  /** Optional title shown above skeleton grid */
  title?: string
  /** Content to render when not loading */
  children?: React.ReactNode
  /** Additional class names */
  className?: string
}

function SkeletonCardUnit({ size }: { size: SkeletonSize }) {
  const { height } = SIZE_VARIANTS[size]
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-32" aria-hidden />
          <Skeleton className="h-5 w-16 rounded-full" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className={cn('w-20', height === 'h-32' ? 'h-8' : 'h-10')} aria-hidden />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-full rounded" aria-hidden />
          <Skeleton className="h-12 w-12 rounded" aria-hidden />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" aria-hidden />
          <Skeleton className="h-3 w-4/5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingSkeletonCard({
  isLoading,
  skeletonCount = 3,
  size = 'md',
  title,
  children,
  className,
}: LoadingSkeletonCardProps) {
  const count = typeof skeletonCount === 'number' && skeletonCount > 0 ? skeletonCount : 3
  const safeCount = Math.min(Math.max(count, 1), 12)

  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-live="polite">
      {title && (
        <p className="text-sm font-medium text-muted-foreground" id="skeleton-title">
          {title}
        </p>
      )}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading content"
      >
        {Array.from({ length: safeCount }).map((_, i) => (
          <SkeletonCardUnit key={i} size={size} />
        ))}
      </div>
    </div>
  )
}
