import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { MethodologyBlock } from './MethodologyBlock'
import { FAQBlock } from './FAQBlock'
import { SupportFormBlock } from './SupportFormBlock'
import { RoadmapTeaserBlock } from './RoadmapTeaserBlock'

export function AboutHelpLayout() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none bg-card text-foreground"
      >
        Skip to main content
      </a>
      <Navbar variant="public" />
      <main
        id="main-content"
        className="flex-1 container px-4 py-12 md:py-16 lg:py-20"
        role="main"
      >
        <div className="mx-auto max-w-3xl">
          <header className="mb-12 md:mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              About & Help
            </h1>
            <p className="mt-4 text-lg text-muted-foreground" style={{ lineHeight: 1.6 }}>
              Methodology, FAQ, and support for Gbox360 Investor Perception Index.
              Understand how we compute the IPI, find answers, and get in touch.
            </p>
          </header>

          <div className="grid gap-12 md:gap-16">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <MethodologyBlock />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <FAQBlock />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <SupportFormBlock />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <RoadmapTeaserBlock />
            </div>
          </div>

          <div className="mt-12 flex justify-center pt-4">
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
