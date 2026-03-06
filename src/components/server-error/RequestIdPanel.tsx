import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RequestIdPanelProps {
  /** Request ID to display and copy */
  requestId: string
  /** Optional class name */
  className?: string
}

/**
 * Displays Request ID with copy-to-clipboard control.
 * Shows toast feedback on successful copy.
 */
export function RequestIdPanel({ requestId, className }: RequestIdPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const value = requestId ?? 'UNKNOWN'
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Request ID copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy Request ID')
    }
  }, [requestId])

  const displayId = typeof requestId === 'string' && requestId.length > 0
    ? requestId
    : 'UNKNOWN'

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-muted/50 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Request ID
          </p>
          <p className="mt-0.5 font-mono text-sm text-foreground break-all">
            {displayId}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 h-9 px-3 rounded-full"
          aria-label="Copy Request ID to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
