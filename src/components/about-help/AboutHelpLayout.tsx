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
        aria-labelledby="page-title"
      >
        <div className="mx-auto max-w-3xl">
          <header className="mb-12 md:mb-16 animate-fade-in-up">
            <h1
              id="page-title"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              About & Help
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Methodology, FAQ, and support for Gbox360 Investor Perception Index.
              Understand how we compute the IPI, find answers, and get in touch.
            </p>
          </header>

          <nav aria-label="Page sections" className="sr-only">
            <h2 className="text-base font-semibold text-foreground">On this page</h2>
            <ul className="mt-2 space-y-1 list-none pl-0">
              <li><a href="#methodology" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Methodology</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Frequently Asked Questions</a></li>
              <li><a href="#support" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Contact Support</a></li>
              <li><a href="#roadmap" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Roadmap</a></li>
            </ul>
          </nav>

          <div className="grid gap-12 md:gap-16">
            <div className="animate-fade-in-up-delay-1">
              <MethodologyBlock />
            </div>
            <div className="animate-fade-in-up-delay-2">
              <FAQBlock />
            </div>
            <div className="animate-fade-in-up-delay-3">
              <SupportFormBlock />
            </div>
            <div className="animate-fade-in-up-delay-4">
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
