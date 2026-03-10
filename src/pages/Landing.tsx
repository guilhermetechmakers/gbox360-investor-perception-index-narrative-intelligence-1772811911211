import { Navbar } from '@/components/layout/Navbar'
import { LandingHero } from '@/components/landing/LandingHero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { SampleIPISnapshot } from '@/components/landing/SampleIPISnapshot'
import { FeatureHighlights } from '@/components/landing/FeatureHighlights'
import { TrustCompliance } from '@/components/landing/TrustCompliance'
import { FooterLinks } from '@/components/landing/FooterLinks'

export interface LandingProps {
  /** When true, shows loading skeletons in the features section. */
  isLoading?: boolean
  /** When set, shows error state in the features section. */
  error?: Error | string | null
}

export function Landing({ isLoading = false, error = null }: LandingProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main aria-label="Landing page content" className="min-h-screen">
        <LandingHero
          ctaPrimary={{ label: 'Get started free', href: '/signup' }}
          ctaSecondary={{ label: 'Request demo', href: '/login' }}
          ctaTertiary={{ label: 'Explore sample IPI', href: '#sample-ipi' }}
        />
        <HowItWorks />
        <SampleIPISnapshot />
        <FeatureHighlights isLoading={isLoading} error={error} />
        <TrustCompliance />
      </main>
      <FooterLinks />
    </div>
  )
}
