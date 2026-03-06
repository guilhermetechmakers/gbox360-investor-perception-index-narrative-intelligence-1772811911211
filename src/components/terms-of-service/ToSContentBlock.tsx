import { cn } from '@/lib/utils'
import { ToSChip } from './ToSChip'
import type { TosSection } from '@/types/terms-of-service'

export interface ToSContentBlockProps {
  section: TosSection
  className?: string
}

/**
 * Renders a section block with semantic article/sectioning.
 * Supports h2/h3 hierarchy, ordered/unordered lists, block quotes for legal notes.
 */
export function ToSContentBlock({ section, className }: ToSContentBlockProps) {
  const {
    id,
    heading,
    body,
    subsections = [],
    listItems = [],
    isImportant,
    isDisclaimer,
  } = section ?? {}

  const safeSubsections = Array.isArray(subsections) ? subsections : []
  const safeListItems = Array.isArray(listItems) ? listItems : []
  const hasBody = typeof body === 'string' && body.trim().length > 0

  return (
    <article
      id={id}
      className={cn(
        'rounded-[10px] border border-border bg-card p-6 md:p-7',
        'shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.5rem]"
          >
            {heading ?? ''}
          </h2>
          {isImportant && (
            <ToSChip text="Important" variant="important" aria-label="Important clause" />
          )}
          {isDisclaimer && (
            <ToSChip text="Disclaimers" variant="disclaimer" aria-label="Disclaimer clause" />
          )}
        </div>
      </header>

      {hasBody && (
        <div
          className={cn(
            'prose prose-slate max-w-none text-base leading-[1.6] text-foreground',
            'prose-p:text-muted-foreground prose-p:leading-[1.6]',
            'prose-headings:text-foreground prose-headings:font-semibold',
            'prose-ul:my-4 prose-li:text-muted-foreground'
          )}
        >
          <p className="text-muted-foreground leading-[1.6]">{body}</p>
        </div>
      )}

      {safeListItems.length > 0 && (
        <ul className="mt-4 space-y-2 pl-6 list-disc text-muted-foreground text-base leading-[1.6]">
          {(safeListItems ?? []).map((item, idx) => (
            <li key={idx}>{item ?? ''}</li>
          ))}
        </ul>
      )}

      {safeSubsections.length > 0 && (
        <div className="mt-6 space-y-6">
          {(safeSubsections ?? []).map((sub, idx) => (
            <div key={sub?.heading ?? idx}>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {sub?.heading ?? ''}
              </h3>
              <p className="text-muted-foreground text-base leading-[1.6]">
                {sub?.text ?? ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
