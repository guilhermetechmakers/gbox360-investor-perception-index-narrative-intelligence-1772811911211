import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HelpCircle, Mail } from 'lucide-react'

export function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="public" />
      <main className="container px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-12 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold">About & Help</h1>
            <p className="mt-2 text-muted-foreground">
              Methodology, FAQ, and support for Gbox360 Investor Perception Index.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Methodology</CardTitle>
              <CardDescription>How the IPI is computed</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-sm">
              <p>
                The Investor Perception Index (IPI) is an explainable, audit-first metric built from
                constrained external signals: news (NewsAPI), social (X/Twitter read-only), and
                batch earnings transcripts (S3). All raw payloads are preserved in an append-only
                store and normalized into a canonical <strong>NarrativeEvent</strong> model.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong>NarrativeEvent schema:</strong> event_id, raw_payload_id, source, platform,
                  speaker_entity, speaker_role, audience_class, raw_text, ingestion_timestamp,
                  original_timestamp, metadata, authority_score, credibility_flags.
                </li>
                <li>
                  <strong>Topic classification:</strong> Rule-based keywords first; optional
                  embeddings for clustering. Time-decayed persistence metric for narrative scoring.
                </li>
                <li>
                  <strong>Authority weighting:</strong> Analyst &gt; Media &gt; Retail tiers applied
                  during aggregation.
                </li>
                <li>
                  <strong>IPI formula (provisional):</strong> 40% Narrative + 40% Credibility + 20%
                  Risk. Weights are configurable and logged; every export includes input vectors and
                  weight version.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Why &quot;provisional&quot; weights?</p>
                <p className="text-sm text-muted-foreground">
                  We surface the current default (40/40/20) and allow experimentation in Settings.
                  Audit exports always use the server-configured weights and log the version for
                  reproducibility.
                </p>
              </div>
              <div>
                <p className="font-medium">How do I export an audit artifact?</p>
                <p className="text-sm text-muted-foreground">
                  From Company View or Drilldown, click &quot;Export snapshot&quot; or
                  &quot;Audit export&quot;. A background job generates signed JSON + PDF with raw
                  payload refs and integrity hashes; you receive a download link by email.
                </p>
              </div>
              <div>
                <p className="font-medium">Where can I see raw payloads?</p>
                <p className="text-sm text-muted-foreground">
                  In the &quot;Why did this move?&quot; drilldown, each event has a raw payload
                  button. Admins can use the Raw Payload Browser for full search and replay.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support
              </CardTitle>
              <CardDescription>Get help or report issues</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@gbox360.com"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                support@gbox360.com
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Roadmap and feature requests are tracked internally; we’ll share updates via product
                communications.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
