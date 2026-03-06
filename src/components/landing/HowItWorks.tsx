import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Database, GitMerge, BarChart3 } from 'lucide-react'

export interface StepCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  microCopy?: string
  className?: string
}

function StepCard({ icon: Icon, title, description, microCopy, className }: StepCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        'animate-fade-in-up',
        className
      )}
    >
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground" style={{ lineHeight: 1.6 }}>
          {description}
        </p>
        {microCopy && (
          <p className="text-xs text-muted-foreground/80 mt-1">{microCopy}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0" />
    </Card>
  )
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
      className={cn('border-t border-border bg-muted/30 py-16 md:py-20', className)}
      aria-labelledby="how-it-works-title"
    >
      <div className="container px-4">
        <h2
          id="how-it-works-title"
          className="text-center text-2xl font-semibold md:text-3xl mb-12 md:mb-16"
        >
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {(items ?? []).map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <StepCard
                icon={step.icon}
                title={step.title}
                description={step.description}
                microCopy={step.microCopy}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
