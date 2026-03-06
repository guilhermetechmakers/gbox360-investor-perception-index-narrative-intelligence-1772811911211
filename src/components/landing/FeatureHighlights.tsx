import { FeatureCard } from '@/components/landing/FeatureCard'
import { FileJson, FileCheck, GitBranch, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export interface FeatureHighlightsProps {
  features?: FeatureItem[]
  className?: string
}

export function FeatureHighlights({ features = DEFAULT_FEATURES, className }: FeatureHighlightsProps) {
  const items = Array.isArray(features) ? features : DEFAULT_FEATURES

  return (
    <section
      className={cn('border-t border-border py-16 md:py-20', className)}
      aria-labelledby="features-title"
    >
      <div className="container px-4">
        <h2
          id="features-title"
          className="text-center text-2xl font-semibold md:text-3xl mb-12 md:mb-16"
        >
          Feature highlights
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(items ?? []).map((feature, i) => (
            <div
              key={feature.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                tag={feature.tag}
                ctaLabel={feature.ctaLabel}
                ctaLink={feature.ctaLink}
                icon={feature.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
