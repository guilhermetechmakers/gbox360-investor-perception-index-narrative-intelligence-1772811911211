import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
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

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

export function LandingHero({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ctaPrimary = DEFAULT_CTA_PRIMARY,
  ctaSecondary = DEFAULT_CTA_SECONDARY,
  ctaTertiary = DEFAULT_CTA_TERTIARY,
  className,
}: LandingHeroProps) {
  const shouldReduceMotion = useReducedMotion()
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
    <motion.section
      className={cn(
        'container px-4 py-16 md:py-24 lg:py-32',
        'relative overflow-hidden',
        className
      )}
      aria-labelledby="hero-title"
      initial={shouldReduceMotion ? false : 'initial'}
      animate={shouldReduceMotion ? false : 'animate'}
      variants={{
        initial: {},
        animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
      }}
    >
      {/* Animated gradient mesh background */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(15, 23, 42, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(255, 107, 74, 0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)',
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  background: [
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(15, 23, 42, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(255, 107, 74, 0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)',
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(15, 23, 42, 0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 70% 50%, rgba(255, 107, 74, 0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 30% 70%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                    'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(15, 23, 42, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(255, 107, 74, 0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 20% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)',
                  ],
                }
          }
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl text-center relative">
        <motion.h1
          id="hero-title"
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem]"
          style={{ lineHeight: 1.2 }}
          variants={fadeInUp}
        >
          {title ?? DEFAULT_TITLE}
        </motion.h1>
        <motion.p
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          style={{ lineHeight: 1.6 }}
          variants={fadeInUp}
        >
          {subtitle ?? DEFAULT_SUBTITLE}
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          variants={fadeInUp}
        >
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
        </motion.div>
      </div>
    </motion.section>
  )
}
