import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BarChart3, FileCheck, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main>
        <section className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem]">
              Auditable Investor Perception Index
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Transform news, social, and earnings signals into a transparent, explainable narrative index. 
              See what changed and why—with full provenance and exportable audit artifacts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Request demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container px-4">
            <h2 className="text-center text-2xl font-semibold mb-12">How it works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: BarChart3, title: 'Select company & window', desc: 'Choose a company and time range to view the current IPI score and directional movement.' },
                { icon: FileCheck, title: 'Drill down to narratives', desc: 'See top narratives and trace every contribution back to specific events and raw payloads.' },
                { icon: Shield, title: 'Export signed artifacts', desc: 'Generate signed JSON + PDF audit artifacts with integrity hashes for compliance and trust.' },
              ].map((item, i) => (
                <Card key={i} className={cn('animate-fade-in-up')} style={{ animationDelay: `${i * 100}ms` }}>
                  <CardHeader>
                    <item.icon className="h-10 w-10 text-primary" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold">Sample IPI snapshot</h2>
            <p className="mt-2 text-muted-foreground">
              Narrative 40% · Credibility 40% · Risk 20% (provisional weights)
            </p>
            <Card className="mt-8 text-left">
              <CardHeader>
                <CardTitle>Example Co. (EXCO)</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">72</span>
                  <span className="text-muted-foreground">+4% vs prior period</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Top narratives: Earnings guidance, ESG coverage, Analyst upgrades. 
                  Full traceability and raw payloads available in the app.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="container px-4">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h2 className="text-xl font-semibold">Trust & compliance ready</h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                Append-only event store, idempotent ingestion, and KMS-signed exports. 
                Built for institutional PMs, IR teams, and auditors.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
