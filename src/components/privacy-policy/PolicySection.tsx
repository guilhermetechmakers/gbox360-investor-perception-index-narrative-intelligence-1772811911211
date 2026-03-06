import { cn } from '@/lib/utils'
import type { PolicySubsection } from '@/types/privacy-policy'

export interface PolicySectionProps {
  id?: string
  title: string
  bodyText?: string
  bodyHtml?: string
  subsections?: PolicySubsection[] | null
  className?: string
}

/**
 * Renders a titled policy content block with typographic hierarchy.
 * Supports plain text or sanitized HTML. Guards against null/undefined.
 */
export function PolicySection({
  id,
  title,
  bodyText,
  bodyHtml,
  subsections = [],
  className,
}: PolicySectionProps) {
  const content = bodyText ?? bodyHtml ?? ''
  const hasContent = typeof content === 'string' && content.length > 0
  const safeSubsections = Array.isArray(subsections) ? subsections : []

  return (
    <section
      id={id}
      className={cn(
        'rounded-[10px] border border-border bg-card p-6 md:p-7',
        'shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <header className="mb-6">
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.5rem]"
        >
          {title}
        </h2>
      </header>

      {hasContent && (
        <div
          className={cn(
            'prose prose-slate max-w-none text-base leading-relaxed text-foreground',
            'prose-p:text-muted-foreground prose-p:leading-[1.6]',
            'prose-headings:text-foreground prose-headings:font-semibold'
          )}
        >
          {bodyHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
              className="[&>p]:mb-4 [&>p:last-child]:mb-0"
            />
          ) : (
            <p className="text-muted-foreground leading-[1.6]">{bodyText}</p>
          )}
        </div>
      )}

      {(safeSubsections ?? []).length > 0 && (
        <div className="mt-6 space-y-6">
          {(safeSubsections ?? []).map((sub) => (
            <div key={sub?.id ?? sub?.title ?? Math.random()}>
              <h3 className="text-lg font-medium text-foreground mb-2">{sub?.title ?? ''}</h3>
              <p className="text-muted-foreground text-base leading-[1.6]">
                {sub?.content ?? ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
