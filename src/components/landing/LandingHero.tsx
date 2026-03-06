import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LandingHeroProps {
  title?: string
  subtitle?: string
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; onClick?: () => void }
  className?: string
}

const DEFAULT_TITLE = 'Auditable Investor Perception Index'
const DEFAULT_SUBTITLE =
  'Transform news, social, and earnings signals into a transparent, explainable narrative index. See what changed and why—with full provenance and exportable audit artifacts.'
const DEFAULT_CTA_PRIMARY = { label: 'Sign up', href: '/signup' }
const DEFAULT_CTA_SECONDARY = { label: 'Explore sample IPI', onClick: undefined }

export function LandingHero({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ctaPrimary = DEFAULT_CTA_PRIMARY,
  ctaSecondary = DEFAULT_CTA_SECONDARY,
  className,
}: LandingHeroProps) {
  const handleSecondaryClick = () => {
    if (ctaSecondary?.onClick) {
      ctaSecondary.onClick()
    } else {
      document.getElementById('sample-ipi')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className={cn(
        'container px-4 py-16 md:py-24 lg:py-32',
        'relative overflow-hidden',
        className
      )}
      aria-labelledby="hero-heading"
    >
      {/* Subtle animated gradient background */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <h1
          id="hero-heading"
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] lg:text-[4rem] leading-tight"
        >
          {title ?? DEFAULT_TITLE}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle ?? DEFAULT_SUBTITLE}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="min-h-[44px] px-8"
            aria-label={ctaPrimary?.label ?? 'Sign up'}
          >
            <Link to={ctaPrimary?.href ?? '/signup'}>
              {ctaPrimary?.label ?? 'Sign up'}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-h-[44px] px-8"
            onClick={handleSecondaryClick}
            aria-label={ctaSecondary?.label ?? 'Explore sample IPI'}
          >
            {ctaSecondary?.label ?? 'Explore sample IPI'}
          </Button>
        </div>
      </div>
    </section>
  )
}
