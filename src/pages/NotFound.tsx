import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  NotFoundHeader,
  SearchBox,
  QuickLinks,
  type QuickLink,
} from '@/components/not-found'
import { MapPinOff } from 'lucide-react'

const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About & Help', href: '/about' },
]

export function NotFound() {
  const [quickLinks] = useState<QuickLink[]>(() => DEFAULT_QUICK_LINKS)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NotFoundHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-8 md:py-16">
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in-up motion-reduce:animate-none">
          {/* Visual guidance */}
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted shadow-md mb-8 border border-border"
            aria-hidden
          >
            <MapPinOff className="h-8 w-8 text-foreground/80" />
          </div>

          {/* Hero headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]">
            404: We can&apos;t seem to find that page
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base text-foreground/80 leading-relaxed max-w-xl mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
          </p>

          {/* Search box */}
          <div className="mt-8 flex justify-center">
            <SearchBox placeholder="Search for a company, report, or topic…" />
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>

          {/* Optional quick links */}
          {Array.isArray(quickLinks) && quickLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-foreground/80 mb-4">Quick links</p>
              <QuickLinks links={quickLinks} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
