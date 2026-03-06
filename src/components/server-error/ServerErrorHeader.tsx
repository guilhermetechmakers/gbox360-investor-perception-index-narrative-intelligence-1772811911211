import { Link } from 'react-router-dom'
import { Building2, Home, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServerErrorHeaderProps {
  className?: string
}

/**
 * Minimal header for 500 error page, consistent with NotFoundHeader.
 * Preserves navigation chrome for recovery paths.
 */
export function ServerErrorHeader({ className }: ServerErrorHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-card',
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-foreground/90 transition-colors duration-150"
          aria-label="Go to home"
        >
          <Building2 className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Gbox360</span>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Quick navigation">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
