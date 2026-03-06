import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LandingHeroProps {
  title?: string
  subtitle?: string
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href?: string; onClick?: () => void }
  ctaTertiary?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

const DEFAULT_TITLE = 'Auditable Investor Perception Index'
const DEFAULT_SUBTITLE =
  'Transform news, social, and earnings signals into a transparent, explainable narrative index. See what changed and why—with full provenance and exportable audit artifacts.'
const DEFAULT_CTA_PRIMARY = { label: 'Sign up', href: '/signup' }
const DEFAULT_CTA_SECONDARY = { label: 'Request demo', href: '/login' }
const DEFAULT_CTA_TERTIARY = { label: 'Explore sample IPI', href: '#sample-ipi' }

export function LandingHero({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ctaPrimary = DEFAULT_CTA_PRIMARY,
  ctaSecondary = DEFAULT_CTA_SECONDARY,
  ctaTertiary = DEFAULT_CTA_TERTIARY,
  className,
}: LandingHeroProps) {
  const isTertiaryScroll = ctaTertiary?.href?.startsWith('#') ?? false
  const handleTertiaryClick = () => {
    if (ctaTertiary?.onClick) {
      ctaTertiary.onClick()
    } else if (isTertiaryScroll && ctaTertiary?.href) {
      const el = document.querySelector(ctaTertiary.href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className={cn(
        'container px-4 py-16 md:py-24 lg:py-32',
        'relative overflow-hidden',
        'animate-fade-in-up',
        className
      )}
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 -z-10 opacity-30 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </div>
      <div className="mx-auto max-w-4xl text-center relative">
        <h1
          id="hero-title"
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem]"
          style={{ lineHeight: 1.2 }}
        >
          {title ?? DEFAULT_TITLE}
        </h1>
        <p
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          style={{ lineHeight: 1.6 }}
        >
          {subtitle ?? DEFAULT_SUBTITLE}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="min-h-[44px] min-w-[120px]"
            aria-label={ctaPrimary?.label ?? 'Sign up'}
          >
            <Link to={ctaPrimary?.href ?? '/signup'}>
              {ctaPrimary?.label ?? 'Sign up'}
            </Link>
          </Button>
          {ctaSecondary && (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-h-[44px] min-w-[120px]"
              aria-label={ctaSecondary.label}
            >
              <Link to={ctaSecondary.href ?? '/login'}>{ctaSecondary.label}</Link>
            </Button>
          )}
          {ctaTertiary && (isTertiaryScroll || ctaTertiary.onClick) ? (
            <Button
              size="lg"
              variant="ghost"
              className="min-h-[44px] min-w-[120px]"
              aria-label={ctaTertiary.label}
              onClick={handleTertiaryClick}
            >
              {ctaTertiary.label}
            </Button>
          ) : ctaTertiary?.href ? (
            <Button size="lg" variant="ghost" asChild className="min-h-[44px] min-w-[120px]" aria-label={ctaTertiary.label}>
              <Link to={ctaTertiary.href}>{ctaTertiary.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
