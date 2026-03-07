/**
 * Premium split-screen auth layout.
 * Left: branded panel with gradient + messaging. Right: form content.
 */
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Building2, TrendingUp, Shield, BarChart3 } from 'lucide-react'

export interface LayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

function BrandedPanel() {
  return (
    <div className="auth-branded-panel hidden lg:flex lg:flex-1 flex-col justify-between p-12 xl:p-16 relative">
      <div className="relative z-10">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white" aria-label="Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          Gbox360
        </Link>
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Narrative intelligence
            <br />
            <span className="gradient-text-light">for modern investors</span>
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed max-w-md">
            Transform market signals into auditable, explainable perception indices with full provenance and compliance-ready exports.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Real-time IPI tracking</p>
              <p className="text-xs text-white/40">Multi-source signal aggregation</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Audit-first architecture</p>
              <p className="text-xs text-white/40">KMS-signed, append-only records</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Explainable scoring</p>
              <p className="text-xs text-white/40">Full drill-down traceability</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs text-white/20">
          &copy; {new Date().getFullYear()} Gbox360. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen flex">
      <BrandedPanel />

      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center bg-background p-6 sm:p-8 lg:p-12',
          'lg:max-w-[580px] xl:max-w-[640px]',
          className
        )}
      >
        <div className="w-full max-w-[420px] mx-auto">{children}</div>
      </div>
    </div>
  )
}
