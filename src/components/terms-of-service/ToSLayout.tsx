import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { TocNav } from './TocNav'
import { ToSContentBlock } from './ToSContentBlock'
import { ExternalLinkBlock } from './ExternalLinkBlock'
import { AcceptBanner } from './AcceptBanner'
import type { TosSection } from '@/types/terms-of-service'

export interface ToSLayoutProps {
  title?: string
  sections?: TosSection[]
  lastUpdated?: string
  version?: string
  showAcceptBanner?: boolean
  onAccept?: () => void
}

/**
 * Page shell with header, breadcrumb/section nav, content container, and footer.
 * Responsive typography, accessible anchor navigation, skip-to-content support.
 */
export function ToSLayout({
  title = 'Terms of Service',
  sections = [],
  lastUpdated = '',
  version = '1.0',
  showAcceptBanner = false,
  onAccept,
}: ToSLayoutProps) {
  const safeSections = Array.isArray(sections) ? sections : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none bg-card text-foreground"
      >
        Skip to main content
      </a>
      <Navbar variant="public" />

      <main
        id="main-content"
        className="flex-1 container px-4 py-12 md:py-16 lg:py-20"
        role="main"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Content column */}
            <div className="lg:col-span-8">
              {/* Hero / Header */}
              <header className="mb-12 md:mb-16 animate-fade-in-up">
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                    <li>
                      <Link
                        to="/"
                        className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      >
                        Home
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li className="text-foreground font-medium" aria-current="page">
                      {title}
                    </li>
                  </ol>
                </nav>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]">
                  {title}
                </h1>
                <p
                  className="mt-4 text-lg text-muted-foreground"
                  style={{ lineHeight: 1.6 }}
                >
                  Please read these terms carefully before using Gbox360. By
                  accessing or using our platform, you agree to be bound by these
                  Terms of Service.
                </p>
                {(lastUpdated || version) && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lastUpdated && <>Last updated: {lastUpdated}</>}
                    {lastUpdated && version && ' · '}
                    {version && <>Version {version}</>}
                  </p>
                )}
              </header>

              {showAcceptBanner && (
                <div className="mb-8 animate-fade-in-up">
                  <AcceptBanner onAccept={onAccept} />
                </div>
              )}

              {/* Section content */}
              <div className="space-y-8 md:space-y-10">
                {(safeSections ?? []).map((section, index) => (
                  <div
                    key={section?.id ?? index}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${0.05 + index * 0.03}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <ToSContentBlock section={section ?? { id: '', heading: '', body: '' }} />
                  </div>
                ))}
              </div>

              {/* Policy links & CTA */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <ExternalLinkBlock />
                  <Button asChild variant="outline" className="min-h-[44px] shrink-0">
                    <Link to="/">Back to home</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* TOC - mobile: collapsible at top (order-first); desktop: sticky sidebar */}
            <aside className="lg:col-span-4 order-first lg:order-none">
              <div className="lg:hidden mb-8 animate-fade-in-up">
                <details className="rounded-[10px] border border-border bg-card p-4 shadow-card">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                    <span className="flex items-center gap-2">On this page</span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-border">
                    <TocNav sections={safeSections} className="!static !top-0" showHeading={false} />
                  </div>
                </details>
              </div>
              <div className="hidden lg:block animate-fade-in-up">
                <TocNav sections={safeSections} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
