import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Shield, Database, FileCheck } from 'lucide-react'

export interface TrustComplianceProps {
  auditabilityStatement?: string
  dataRetentionSnippet?: string
  className?: string
}

const DEFAULT_AUDITABILITY =
  'Append-only event store, idempotent ingestion, and KMS-signed exports. Built for institutional PMs, IR teams, and auditors.'

const DEFAULT_RETENTION =
  'Raw payloads retained for audit. Configurable retention with integrity hashes. Signed artifacts include provenance metadata and weight versions.'

export function TrustCompliance({
  auditabilityStatement = DEFAULT_AUDITABILITY,
  dataRetentionSnippet = DEFAULT_RETENTION,
  className,
}: TrustComplianceProps) {
  return (
    <section
      className={cn('border-t border-border bg-muted/30 py-16 md:py-20', className)}
      aria-labelledby="trust-title"
    >
      <div className="container px-4">
        <h2
          id="trust-title"
          className="text-center text-2xl font-semibold md:text-3xl mb-12 md:mb-16"
        >
          Trust & compliance ready
        </h2>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-8 md:p-10 shadow-card">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Shield className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold">Auditability</h3>
                  <p className="mt-1 text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
                    {auditabilityStatement ?? DEFAULT_AUDITABILITY}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Database className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold">Data retention</h3>
                  <p className="mt-1 text-muted-foreground text-sm" style={{ lineHeight: 1.6 }}>
                    {dataRetentionSnippet ?? DEFAULT_RETENTION}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-16 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  Logo
                </div>
                <span>Enterprise partner</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-16 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  Logo
                </div>
                <span>Institutional client</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCheck className="h-5 w-5 text-success" aria-hidden />
                <span className="italic">&ldquo;Board-credible audit trail.&rdquo;</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button asChild aria-label="Get started">
                <Link to="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
