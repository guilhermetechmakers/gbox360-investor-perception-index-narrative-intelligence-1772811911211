/**
 * Responsive layout wrapper for auth pages.
 * 12-column grid, centered content, global padding.
 */
import { cn } from '@/lib/utils'

export interface LayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8',
        className
      )}
    >
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  )
}
