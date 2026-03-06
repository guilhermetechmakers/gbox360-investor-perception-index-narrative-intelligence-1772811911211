import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title: string
  meta?: string
  variant?: 'default' | 'highlight'
  children: React.ReactNode
  className?: string
  id?: string
}

export function SectionCard({
  title,
  meta,
  variant = 'default',
  children,
  className,
  id,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded-[10px] border border-border bg-card p-6 md:p-7 transition-all duration-220',
        'shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
        variant === 'highlight' && 'ring-1 ring-accent/20',
        className
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <header className="mb-6">
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {meta && (
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        )}
      </header>
      {children}
    </section>
  )
}
