import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RequestIdPanelProps {
  /** Request ID to display (sanitized; use "UNKNOWN" if missing) */
  requestId: string
  /** Optional className */
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

  const displayId = typeof requestId === 'string' && requestId.length > 0 ? requestId : 'UNKNOWN'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-border bg-muted/50 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">Request ID</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5 px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Copy request ID ${displayId}`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" aria-hidden />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <code className="break-all font-mono text-sm text-foreground">{displayId}</code>
    </div>
  )
}
