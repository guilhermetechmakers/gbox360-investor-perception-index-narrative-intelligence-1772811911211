/**
 * Lightweight JSON syntax highlighting for raw payload display.
 * Uses CSS classes for keys, strings, numbers, booleans, and null.
 * Wraps content in shadcn Card and ScrollArea with accessible labels.
 */

import { useId } from 'react'
import { AlertCircle, FileJson } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface JsonHighlightProps {
  /** Raw JSON string to highlight and display */
  content: string
  /** Optional CSS class for the inner pre/code block */
  className?: string
  /** Optional visible title; used for aria-labelledby when provided */
  title?: string
  /** Override for the accessible name (default: "JSON content" or title) */
  ariaLabel?: string
  /** When true, shows a loading skeleton instead of content */
  isLoading?: boolean
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function JsonHighlight({
  content,
  className,
  title,
  ariaLabel,
  isLoading = false,
}: JsonHighlightProps) {
  const generatedId = useId()
  const labelId = title ? `json-highlight-${generatedId}` : undefined
  const resolvedAriaLabel =
    ariaLabel ?? title ?? 'JSON content'

  if (isLoading) {
    return (
      <Card
        className="rounded-[10px] border-[rgb(var(--border))] shadow-sm transition-shadow duration-200"
        aria-busy="true"
        aria-label={resolvedAriaLabel}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full max-w-[90%]" />
            <Skeleton className="h-4 w-full max-w-[70%]" />
            <Skeleton className="h-4 w-full max-w-[85%]" />
            <Skeleton className="h-4 w-full max-w-[60%]" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const isEmpty = !content || typeof content !== 'string' || content.trim() === ''

  if (isEmpty) {
    return (
      <Card
        className="rounded-[10px] border-[rgb(var(--border))] shadow-sm transition-shadow duration-200"
        aria-label={resolvedAriaLabel}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 sm:p-10">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-hidden
          >
            <FileJson className="h-6 w-6" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            No JSON content to display
          </p>
        </CardContent>
      </Card>
    )
  }

  let result: { type: 'success'; html: string } | { type: 'fallback'; raw: string }
  try {
    const formatted = JSON.stringify(JSON.parse(content), null, 2)
    const parts: string[] = []
    let i = 0
    const len = formatted.length

    while (i < len) {
      if (formatted[i] === '"') {
        const start = i
        i++
        while (i < len) {
          if (formatted[i] === '\\') {
            i += 2
            continue
          }
          if (formatted[i] === '"') {
            i++
            break
          }
          i++
        }
        const raw = formatted.slice(start, i)
        const isKey = formatted.slice(i).match(/^\s*:/)
        parts.push(
          `<span class="json-${isKey ? 'key' : 'string'}">${escapeHtml(raw)}</span>`
        )
        continue
      }

      if (/[-0-9]/.test(formatted[i])) {
        const start = i
        while (i < len && /[-0-9.eE+]/.test(formatted[i])) i++
        const raw = formatted.slice(start, i)
        parts.push(`<span class="json-number">${escapeHtml(raw)}</span>`)
        continue
      }

      if (formatted.slice(i, i + 4) === 'true') {
        parts.push('<span class="json-boolean">true</span>')
        i += 4
        continue
      }

      if (formatted.slice(i, i + 5) === 'false') {
        parts.push('<span class="json-boolean">false</span>')
        i += 5
        continue
      }

      if (formatted.slice(i, i + 4) === 'null') {
        parts.push('<span class="json-null">null</span>')
        i += 4
        continue
      }

      const punct = formatted[i]
      if (['{', '}', '[', ']', ':', ','].includes(punct)) {
        parts.push(`<span class="json-punct">${escapeHtml(punct)}</span>`)
        i++
        continue
      }

      const start = i
      while (
        i < len &&
        ![
          '"',
          '-',
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
          't', 'f', 'n',
          '{', '}', '[', ']', ':', ',',
        ].includes(formatted[i])
      ) {
        i++
      }
      if (i > start) {
        parts.push(escapeHtml(formatted.slice(start, i)))
      }
    }

    result = { type: 'success', html: parts.join('') }
  } catch {
    result = { type: 'fallback', raw: content }
  }

  if (result.type === 'success') {
    return (
      <Card
        className="rounded-[10px] border-[rgb(var(--border))] shadow-sm transition-shadow duration-200 hover:shadow-md"
        aria-label={resolvedAriaLabel}
      >
        {title ? (
          <CardHeader className="pb-2">
            <Label id={labelId} className="text-sm font-medium text-foreground">
              {title}
            </Label>
          </CardHeader>
        ) : null}
        <CardContent className={title ? 'pt-0' : ''}>
          <ScrollArea className="h-full max-h-[min(70vh,28rem)] w-full rounded-[10px] border border-border bg-muted/30">
            <pre
              className={cn(
                'min-h-0 p-4 text-left font-mono text-sm leading-relaxed whitespace-pre-wrap break-words',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'rounded-[10px]',
                className
              )}
              style={{ fontFamily: 'ui-monospace, monospace' }}
              aria-label={labelId ? undefined : resolvedAriaLabel}
              aria-labelledby={labelId ?? undefined}
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="rounded-[10px] border-[rgb(var(--border))] shadow-sm transition-shadow duration-200"
      aria-label={resolvedAriaLabel}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <Label className="text-sm font-medium">Invalid JSON — showing raw content</Label>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-full max-h-[min(70vh,28rem)] w-full rounded-[10px] border border-border bg-muted/30">
          <pre
            className={cn(
              'min-h-0 p-4 text-left font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-muted-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'rounded-[10px]',
              className
            )}
            style={{ fontFamily: 'ui-monospace, monospace' }}
            aria-label="Raw content (invalid JSON)"
            role="region"
          >
            {result.raw}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
