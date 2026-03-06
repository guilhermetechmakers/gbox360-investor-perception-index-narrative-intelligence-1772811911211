/**
 * Lightweight JSON syntax highlighting for raw payload display.
 * Uses CSS classes for keys, strings, numbers, booleans, and null.
 */

interface JsonHighlightProps {
  content: string
  className?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function JsonHighlight({ content, className }: JsonHighlightProps) {
  if (!content || typeof content !== 'string') {
    return <pre className={className}>—</pre>
  }

  try {
    const formatted = JSON.stringify(JSON.parse(content), null, 2)
    const parts: string[] = []
    let i = 0
    const len = formatted.length

    while (i < len) {
      // String (double-quoted)
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

      // Number
      if (/[-0-9]/.test(formatted[i])) {
        const start = i
        while (i < len && /[-0-9.eE+]/.test(formatted[i])) i++
        const raw = formatted.slice(start, i)
        parts.push(`<span class="json-number">${escapeHtml(raw)}</span>`)
        continue
      }

      // Boolean true
      if (formatted.slice(i, i + 4) === 'true') {
        parts.push('<span class="json-boolean">true</span>')
        i += 4
        continue
      }

      // Boolean false
      if (formatted.slice(i, i + 5) === 'false') {
        parts.push('<span class="json-boolean">false</span>')
        i += 5
        continue
      }

      // Null
      if (formatted.slice(i, i + 4) === 'null') {
        parts.push('<span class="json-null">null</span>')
        i += 4
        continue
      }

      // Punctuation (brackets, colons, commas)
      const punct = formatted[i]
      if (['{', '}', '[', ']', ':', ','].includes(punct)) {
        parts.push(`<span class="json-punct">${escapeHtml(punct)}</span>`)
        i++
        continue
      }

      // Whitespace and other
      const start = i
      while (i < len && !['"', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 't', 'f', 'n', '{', '}', '[', ']', ':', ','].includes(formatted[i])) {
        i++
      }
      if (i > start) {
        parts.push(escapeHtml(formatted.slice(start, i)))
      }
    }

    return (
      <pre
        className={className}
        dangerouslySetInnerHTML={{ __html: parts.join('') }}
      />
    )
  } catch {
    return (
      <pre className={className}>
        {content}
      </pre>
    )
  }
}
