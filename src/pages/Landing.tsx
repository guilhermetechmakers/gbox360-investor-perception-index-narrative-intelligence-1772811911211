import { Navbar } from '@/components/layout/Navbar'
import { LandingHero } from '@/components/landing/LandingHero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { SampleIPISnapshot } from '@/components/landing/SampleIPISnapshot'
import { FeatureHighlights } from '@/components/landing/FeatureHighlights'
import { TrustCompliance } from '@/components/landing/TrustCompliance'
import { FooterLinks } from '@/components/landing/FooterLinks'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main>
        <LandingHero
          ctaPrimary={{ label: 'Get started free', href: '/signup' }}
          ctaSecondary={{ label: 'Request demo', href: '/login' }}
          ctaTertiary={{ label: 'Explore sample IPI', href: '#sample-ipi' }}
        />
        <HowItWorks />
        <SampleIPISnapshot />
        <FeatureHighlights />
        <TrustCompliance />
      </main>
      <FooterLinks />
    </div>
  )
}
