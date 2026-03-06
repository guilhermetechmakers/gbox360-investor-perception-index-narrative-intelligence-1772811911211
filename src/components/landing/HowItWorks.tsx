import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Database, GitMerge, FileBarChart } from 'lucide-react'

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
        'transition-all duration-300 hover:-translate-y-1',
        'animate-fade-in-up',
        className
      )}
    >
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        {microCopy && (
          <p className="text-xs text-muted-foreground mt-1">{microCopy}</p>
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
    description: 'Pull from news, social, and earnings transcripts. Preserve raw payloads in append-only storage with idempotency.',
    microCopy: 'NewsAPI · X/Twitter · S3 transcripts',
  },
  {
    icon: GitMerge,
    title: 'Canonicalize',
    description: 'Normalize into immutable NarrativeEvent schema. Apply authority weighting, credibility proxies, and risk signals.',
    microCopy: 'Deterministic · Replayable · Provenance-linked',
  },
  {
    icon: FileBarChart,
    title: 'Explain IPI',
    description: 'Compute transparent IPI (Narrative 40%, Credibility 40%, Risk 20%). Surface top narratives with drill-down to events.',
    microCopy: 'Provisional weights · Signed export artifacts',
  },
]

export interface HowItWorksProps {
  steps?: StepCardProps[]
  className?: string
}

export function HowItWorks({ steps = STEPS, className }: HowItWorksProps) {
  const items = Array.isArray(steps) ? steps : (STEPS ?? [])

  return (
    <section
      className={cn('border-t border-border bg-muted/30 py-16 md:py-24', className)}
      aria-labelledby="how-it-works-heading"
    >
      <div className="container px-4">
        <h2
          id="how-it-works-heading"
          className="text-center text-2xl font-semibold md:text-3xl mb-12 md:mb-16"
        >
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {items.map((step, i) => (
            <StepCard
              key={step.title ?? i}
              icon={step.icon}
              title={step.title ?? ''}
              description={step.description ?? ''}
              microCopy={step.microCopy}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
