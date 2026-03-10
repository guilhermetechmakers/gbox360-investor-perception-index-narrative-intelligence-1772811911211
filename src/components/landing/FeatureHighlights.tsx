import { cn } from '@/lib/utils'
import { FileJson, FileCheck, GitBranch, Map, LayoutGrid, ChevronRight } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'

export interface FeatureItem {
  id: string
  title: string
  description: string
  tag?: string
  ctaLabel?: string
  ctaLink?: string
  icon?: React.ComponentType<{ className?: string }>
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: '1',
    title: 'NarrativeEvent model',
    description:
      'Immutable, append-only schema capturing source, speaker, authority, and credibility. Every event links to raw payloads for full provenance.',
    tag: 'Audit-first',
    icon: FileJson,
  },
  {
    id: '2',
    title: 'Audit export',
    description:
      'Generate signed JSON + PDF artifacts with integrity hashes. KMS-signed exports for compliance and board presentations.',
    tag: 'Compliance',
    ctaLabel: 'Learn more',
    ctaLink: '/about',
    icon: FileCheck,
  },
  {
    id: '3',
    title: 'Drill-down traceability',
    description:
      'See which narratives drove IPI changes. Paginated event lists, raw payload viewer, timeline replay, and filters by source or authority.',
    tag: 'Explainable',
    ctaLabel: 'View methodology',
    ctaLink: '/about',
    icon: GitBranch,
  },
  {
    id: '4',
    title: 'Governance roadmap',
    description:
      'Provisional weights, config-driven scoring, and transparent input logging. Roadmap for 2FA, API keys, and enterprise controls.',
    tag: 'Provisional',
    icon: Map,
  },
]

const FEATURE_ICON_SIZE = 'h-5 w-5'

export interface FeatureHighlightsProps {
  features?: FeatureItem[]
  className?: string
  isLoading?: boolean
  error?: Error | string | null
}

export function FeatureHighlights({
  features = DEFAULT_FEATURES,
  className,
  isLoading = false,
  error = null,
}: FeatureHighlightsProps) {
  const items = Array.isArray(features) ? features : DEFAULT_FEATURES
  const hasItems = (items ?? []).length > 0
  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : null

  return (
    <section
      className={cn('py-12 md:py-16 lg:py-20 bg-background', className)}
      aria-labelledby="features-title"
      aria-busy={isLoading}
    >
      <div className="container px-4">
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Features</p>
            <h2
              id="features-title"
              className="text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight text-foreground"
            >
              Built for institutional rigor
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Every feature designed with auditability, compliance, and explainability in mind.
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
            role="status"
            aria-label="Loading features"
          >
            {[1, 2, 3, 4].map((key) => (
              <Card key={key} className="rounded-[10px] border border-border overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-11 w-11 rounded-xl" aria-hidden />
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Skeleton className="h-5 w-32" aria-hidden />
                    <Skeleton className="h-5 w-16 rounded-full" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-full mb-2" aria-hidden />
                  <Skeleton className="h-4 w-full mb-2" aria-hidden />
                  <Skeleton className="h-4 w-4/5" aria-hidden />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="max-w-md mx-auto">
            <EmptyState
              icon={<LayoutGrid className="h-6 w-6" />}
              title="Unable to load features"
              description={errorMessage}
              action={
                <Button variant="outline" size="sm" asChild>
                  <a href="/">Return home</a>
                </Button>
              }
              className="py-16 rounded-[10px] border border-border bg-card"
            />
          </div>
        ) : !hasItems ? (
          <div className="max-w-md mx-auto">
            <EmptyState
              icon={<LayoutGrid className="h-6 w-6" />}
              title="No features to show"
              description="Feature highlights are not available at the moment. Check back later or contact support."
              className="py-16 rounded-[10px] border border-border bg-card"
            />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {(items ?? []).map((feature) => {
              const Icon = feature.icon
              return (
                <ScrollReveal key={feature.id}>
                  <Card
                    className={cn(
                      'group h-full flex flex-col rounded-[10px] border border-border bg-card',
                      'transition-all duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5 hover:border-accent/20',
                      'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                    )}
                  >
                    <CardHeader className="pb-2">
                      {Icon && (
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent mb-2 transition-colors duration-200 group-hover:bg-accent/15"
                          aria-hidden
                        >
                          <Icon className={cn(FEATURE_ICON_SIZE, 'shrink-0')} />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-card-foreground">{feature.title}</h3>
                        {feature.tag && (
                          <Badge variant="accent" className="shrink-0 text-xs font-semibold">
                            {feature.tag}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                    {feature.ctaLabel && feature.ctaLink && (
                      <CardFooter className="pt-0">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-accent font-semibold hover:text-accent/80 transition-colors duration-200"
                          asChild
                        >
                          <Link
                            to={feature.ctaLink}
                            className="inline-flex items-center gap-1 group/link"
                          >
                            {feature.ctaLabel}
                            <ChevronRight className={cn(FEATURE_ICON_SIZE, 'transition-transform duration-200 group-hover/link:translate-x-0.5')} />
                          </Link>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
