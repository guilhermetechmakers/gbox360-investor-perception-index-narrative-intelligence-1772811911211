import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
  { id: '1', text: 'Earnings guidance revised upward', weight: 0.85 },
  { id: '2', text: 'ESG coverage momentum increasing', weight: 0.72 },
  { id: '3', text: 'Analyst consensus upgrades', weight: 0.68 },
]

function MiniSparkline() {
  const points = [40, 55, 48, 65, 58, 72, 68, 74]
  const width = 160
  const height = 48
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

  const areaD = pathD + ` L ${width - padding} ${height} L ${padding} ${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="text-accent"
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkline-fill)" />
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
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
      className={cn('py-20 md:py-28 bg-muted/30 relative', className)}
      aria-labelledby="sample-ipi-title"
    >
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Copy */}
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Live preview</p>
                <h2
                  id="sample-ipi-title"
                  className="text-3xl font-bold md:text-4xl tracking-tight"
                >
                  See the IPI in action
                </h2>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{tagline}</p>
                <div className="mt-8">
                  <Button asChild className="group">
                    <Link to="/signup">
                      Start tracking
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: IPI Card */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      {companyName} <span className="text-muted-foreground font-medium">({ticker})</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{period}</p>
                  </div>
                  <MiniSparkline />
                </div>

                {/* Score */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-extrabold tracking-tight">{score}</span>
                  <span className={cn('flex items-center gap-1 text-sm font-semibold', directionColor)}>
                    {direction !== 'neutral' && (
                      <TrendingUp
                        className={cn('h-4 w-4', direction === 'down' && 'rotate-180')}
                        aria-hidden
                      />
                    )}
                    {directionLabel} vs prior period
                  </span>
                </div>

                {/* Narratives */}
                <div className="border-t border-border pt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Top narratives
                  </p>
                  <ul className="space-y-3">
                    {(narratives ?? []).slice(0, 3).map((n) => (
                      <li
                        key={n.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-2.5 text-sm text-foreground">
                          <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden />
                          {n.text}
                        </div>
                        {n.weight != null && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent/70"
                                style={{ width: `${(n.weight ?? 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium w-8 text-right">
                              {Math.round((n.weight ?? 0) * 100)}%
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 pt-5 border-t border-border text-xs text-muted-foreground">
                  Full traceability and raw payloads available in the app.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
