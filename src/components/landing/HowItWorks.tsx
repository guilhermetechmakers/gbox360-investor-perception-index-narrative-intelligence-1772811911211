import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Database, GitMerge, BarChart3 } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export interface StepCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  microCopy?: string
  className?: string
}

const STEPS: StepCardProps[] = [
  {
    icon: Database,
    title: 'Ingest',
    description:
      'We pull news, social, and earnings transcripts from constrained sources. Raw payloads are preserved in an append-only store for full auditability.',
    microCopy: 'NewsAPI, X/Twitter, S3 transcripts. Idempotent, rate-limited.',
  },
  {
    icon: GitMerge,
    title: 'Canonicalize',
    description:
      'Every signal is normalized into our immutable NarrativeEvent model. Topic classification, authority weighting, and credibility proxies are applied.',
    microCopy: 'Rule-based + optional embeddings. Time-decay persistence.',
  },
  {
    icon: BarChart3,
    title: 'Explain IPI',
    description:
      'The Investor Perception Index surfaces what changed and why. Drill down to events, view raw payloads, and export signed audit artifacts.',
    microCopy: 'Narrative 40% · Credibility 40% · Risk 20% (provisional).',
  },
]

export interface HowItWorksProps {
  steps?: StepCardProps[]
  className?: string
}

export function HowItWorks({ steps = STEPS, className }: HowItWorksProps) {
  const items = Array.isArray(steps) ? steps : STEPS

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative', className)}
      aria-labelledby="how-it-works-title"
    >
      <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" aria-hidden />

      <div className="container px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">How it works</p>
            <h2
              id="how-it-works-title"
              className="text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight"
            >
              Three steps to clarity
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From raw data to board-ready insights — fully auditable at every step.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {(items ?? []).map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative group">
                  <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold shadow-lg z-10" aria-hidden>
                    {i + 1}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary mb-5 group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    {step.microCopy && (
                      <p className="text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border">
                        {step.microCopy}
                      </p>
                    )}
                  </div>

                  {i < (items?.length ?? 0) - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-border" aria-hidden />
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
