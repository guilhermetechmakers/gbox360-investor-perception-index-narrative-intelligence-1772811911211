import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { FileJson, FileCheck, GitBranch, Map } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { Link } from 'react-router-dom'

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
      className={cn('py-20 md:py-28 bg-background', className)}
      aria-labelledby="features-title"
    >
      <div className="container px-4">
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Features</p>
            <h2
              id="features-title"
              className="text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight"
            >
              Built for institutional rigor
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature designed with auditability, compliance, and explainability in mind.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {(items ?? []).map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-accent/20">
                  {Icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent/15 transition-colors">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-base font-bold">{feature.title}</h3>
                    {feature.tag && (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                        {feature.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  {feature.ctaLabel && feature.ctaLink && (
                    <Link
                      to={feature.ctaLink}
                      className="mt-4 text-sm font-semibold text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
                    >
                      {feature.ctaLabel}
                      <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
