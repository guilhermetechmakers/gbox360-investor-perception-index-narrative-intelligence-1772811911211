import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Shield, Database, FileCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export interface TrustComplianceProps {
  auditabilityStatement?: string
  dataRetentionSnippet?: string
  className?: string
}

const DEFAULT_AUDITABILITY =
  'Append-only event store, idempotent ingestion, and KMS-signed exports. Built for institutional PMs, IR teams, and auditors.'

const DEFAULT_RETENTION =
  'Raw payloads retained for audit. Configurable retention with integrity hashes. Signed artifacts include provenance metadata and weight versions.'

const TRUST_METRICS = [
  { value: '100%', label: 'Audit coverage' },
  { value: '256-bit', label: 'Encryption' },
  { value: '<200ms', label: 'API response' },
  { value: '99.9%', label: 'Uptime SLA' },
]

export function TrustCompliance({
  auditabilityStatement = DEFAULT_AUDITABILITY,
  dataRetentionSnippet = DEFAULT_RETENTION,
  className,
}: TrustComplianceProps) {
  return (
    <section
      className={cn(
        'py-20 md:py-28 relative overflow-hidden',
        'bg-gradient-to-b from-primary via-primary to-primary/95',
        className
      )}
      aria-labelledby="trust-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 30% 70%, rgba(147, 197, 253, 0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="container px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-16 md:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Trust & compliance</p>
            <h2
              id="trust-title"
              className="text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight text-white"
            >
              Enterprise-ready from day one
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Built with the security, auditability, and governance that institutional investors demand.
            </p>
          </div>
        </ScrollReveal>

        {/* Trust metrics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {TRUST_METRICS.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-white">{metric.value}</p>
              <p className="text-sm text-white/50 mt-1">{metric.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success">
                  <Shield className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-white">Auditability</h3>
                  <p className="mt-1 text-white/60 text-sm leading-relaxed">
                    {auditabilityStatement ?? DEFAULT_AUDITABILITY}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ring/20 text-ring">
                  <Database className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-white">Data retention</h3>
                  <p className="mt-1 text-white/60 text-sm leading-relaxed">
                    {dataRetentionSnippet ?? DEFAULT_RETENTION}
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
                <Lock className="h-3.5 w-3.5" />
                <span>KMS Signed</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Append-only</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
                <FileCheck className="h-3.5 w-3.5 text-success" />
                <span>Board-credible</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button
              size="lg"
              asChild
              className="bg-accent hover:bg-accent/90 text-white font-semibold group"
            >
              <Link to="/signup">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
