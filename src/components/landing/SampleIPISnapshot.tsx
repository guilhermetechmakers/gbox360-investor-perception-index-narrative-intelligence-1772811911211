import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export interface NarrativeItem {
  id: string
  text: string
  weight?: number
}

export interface SampleIPISnapshotProps {
  score?: number
  direction?: 'up' | 'down' | 'neutral'
  companyName?: string
  ticker?: string
  period?: string
  topNarratives?: NarrativeItem[]
  tagline?: string
  className?: string
}

const DEFAULT_NARRATIVES: NarrativeItem[] = [
  { id: '1', text: 'Earnings guidance', weight: 0.85 },
  { id: '2', text: 'ESG coverage', weight: 0.72 },
  { id: '3', text: 'Analyst upgrades', weight: 0.68 },
]

/** Mini sparkline SVG placeholder - static data */
function MiniChartPlaceholder() {
  const points = [40, 55, 48, 65, 58, 72, 68]
  const width = 120
  const height = 36
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const padding = 4
  const pathD = points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2)
      const y = height - padding - ((p - min) / range) * (height - padding * 2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="text-accent"
      aria-hidden
    >
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SampleIPISnapshot({
  score = 72,
  direction = 'up',
  companyName = 'Example Co.',
  ticker = 'EXCO',
  period = 'Last 30 days',
  topNarratives = DEFAULT_NARRATIVES,
  tagline = 'Narrative 40% · Credibility 40% · Risk 20% (provisional weights)',
  className,
}: SampleIPISnapshotProps) {
  const narratives = Array.isArray(topNarratives) ? topNarratives : DEFAULT_NARRATIVES
  const directionLabel = direction === 'up' ? '+4%' : direction === 'down' ? '-4%' : '0%'
  const directionColor =
    direction === 'up' ? 'text-success' : direction === 'down' ? 'text-destructive' : 'text-muted-foreground'

  return (
    <section
      id="sample-ipi"
      className={cn('container px-4 py-16 md:py-20', className)}
      aria-labelledby="sample-ipi-title"
    >
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <h2
            id="sample-ipi-title"
            className="text-2xl font-semibold md:text-3xl"
          >
            Sample IPI snapshot
          </h2>
          <p className="mt-2 text-muted-foreground text-sm md:text-base">{tagline}</p>
        </ScrollReveal>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
        <Card className="text-left">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                {companyName} ({ticker})
              </CardTitle>
              <CardDescription>{period}</CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <MiniChartPlaceholder />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold md:text-4xl" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
                {score}
              </span>
              <span className={cn('flex items-center gap-1 text-sm font-medium', directionColor)}>
                {direction !== 'neutral' && (
                  <TrendingUp
                    className={cn('h-4 w-4', direction === 'down' && 'rotate-180')}
                    aria-hidden
                  />
                )}
                {directionLabel} vs prior period
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Top narratives
              </p>
              <ul className="space-y-2">
                {(narratives ?? []).slice(0, 3).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden />
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Full traceability and raw payloads available in the app.
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </section>
  )
}
