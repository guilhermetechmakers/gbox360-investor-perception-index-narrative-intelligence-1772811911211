import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, TrendingUp, Shield, BarChart3 } from 'lucide-react'

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
  'Transform news, social, and earnings signals into a transparent, explainable narrative index. See what changed and why — with full provenance and exportable audit artifacts.'
const DEFAULT_CTA_PRIMARY = { label: 'Get started free', href: '/signup' }
const DEFAULT_CTA_SECONDARY = { label: 'Request demo', href: '/login' }
const DEFAULT_CTA_TERTIARY = { label: 'Explore sample IPI', href: '#sample-ipi' }

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

function FloatingMetricCard({
  label,
  value,
  change,
  icon: Icon,
  delay,
  className,
}: {
  label: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  delay: number
  className?: string
}) {
  return (
    <motion.div
      className={cn('metric-float-card px-4 py-3 flex items-center gap-3', className)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ animation: 'float 6s ease-in-out infinite', animationDelay: `${delay}s` }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">{value}</span>
          <span className="text-xs font-semibold text-success">{change}</span>
        </div>
      </div>
    </motion.div>
  )
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
    <section
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-b from-primary via-primary to-primary/95',
        'pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36 lg:pb-40',
        className
      )}
      aria-labelledby="hero-title"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 107, 74, 0.2) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(147, 197, 253, 0.15) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 50% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <motion.div
        className="container px-4 relative"
        initial={shouldReduceMotion ? false : 'initial'}
        animate={shouldReduceMotion ? false : 'animate'}
        variants={{
          initial: {},
          animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
        }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div className="flex justify-center mb-6" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
              Narrative Intelligence Platform
            </div>
          </motion.div>

          <motion.h1
            id="hero-title"
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white"
            style={{ lineHeight: 1.1 }}
            variants={fadeInUp}
          >
            {title ?? DEFAULT_TITLE}
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
            style={{ lineHeight: 1.7 }}
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
              className="min-h-[48px] min-w-[160px] bg-accent hover:bg-accent/90 text-white font-semibold text-base group"
              aria-label={ctaPrimary?.label ?? 'Get started free'}
            >
              <Link to={ctaPrimary?.href ?? '/signup'}>
                {ctaPrimary?.label ?? 'Get started free'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            {ctaSecondary && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="min-h-[48px] min-w-[160px] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white font-semibold text-base backdrop-blur-sm"
                aria-label={ctaSecondary.label}
              >
                <Link to={ctaSecondary.href ?? '/login'}>{ctaSecondary.label}</Link>
              </Button>
            )}
          </motion.div>

          {ctaTertiary && (
            <motion.div className="mt-4 flex justify-center" variants={fadeInUp}>
              {isTertiaryScroll || ctaTertiary.onClick ? (
                <button
                  className="text-sm text-white/50 hover:text-white/80 transition-colors underline-offset-4 hover:underline"
                  onClick={handleTertiaryClick}
                  aria-label={ctaTertiary.label}
                >
                  {ctaTertiary.label}
                </button>
              ) : ctaTertiary.href ? (
                <Link
                  to={ctaTertiary.href}
                  className="text-sm text-white/50 hover:text-white/80 transition-colors underline-offset-4 hover:underline"
                >
                  {ctaTertiary.label}
                </Link>
              ) : null}
            </motion.div>
          )}

          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>SOC 2 Ready</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Institutional Grade</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Real-time Signals</span>
            </div>
          </motion.div>
        </div>

        {/* Floating metric cards */}
        <div className="hidden lg:block">
          <FloatingMetricCard
            label="IPI Score"
            value="72"
            change="+4.2%"
            icon={TrendingUp}
            delay={0.8}
            className="absolute left-[5%] top-[30%]"
          />
          <FloatingMetricCard
            label="Narratives"
            value="148"
            change="+12"
            icon={BarChart3}
            delay={1.0}
            className="absolute right-[5%] top-[40%]"
          />
          <FloatingMetricCard
            label="Audit Trail"
            value="100%"
            change="verified"
            icon={Shield}
            delay={1.2}
            className="absolute left-[10%] bottom-[15%]"
          />
        </div>
      </motion.div>
    </section>
  )
}
