import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, X, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { RawPayload } from '@/types/admin'

interface PayloadViewerPanelProps {
  payload: RawPayload | null
  onClose: () => void
  onReplay?: (id: string) => void
  onExport?: (id: string) => void
  isReplaying?: boolean
}

function safeJsonStringify(obj: unknown): string {
  if (obj == null) return '{}'
  try {
    if (typeof obj === 'string') {
      try {
        return JSON.stringify(JSON.parse(obj), null, 2)
      } catch {
        return obj
      }
    }
    if (typeof obj === 'object') {
      return JSON.stringify(obj, null, 2)
    }
    return String(obj)
  } catch {
    return '{}'
  }
}

export function PayloadViewerPanel({
  payload,
  onClose,
  onReplay,
  onExport,
  isReplaying = false,
}: PayloadViewerPanelProps) {
  const payloadObj = payload != null && typeof payload === 'object' ? payload : null

  const rawContent = useMemo(() => {
    if (!payloadObj) return '{}'
    const raw = payloadObj.payloadJson ?? payloadObj.rawPayload
    if (typeof raw === 'string') {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        return raw
      }
    }
    return safeJsonStringify({
      id: payloadObj.id,
      source: payloadObj.source,
      ticker: payloadObj.ticker,
      batchId: payloadObj.batchId,
      timestamp: payloadObj.timestamp,
      status: payloadObj.status,
      hash: payloadObj.hash,
      provenance: payloadObj.provenance,
      rawPayload: payloadObj.rawPayload,
    })
  }, [payloadObj])

  const handleCopy = () => {
    if (!rawContent) return
    navigator.clipboard.writeText(rawContent).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  const handleDownload = () => {
    if (!rawContent || !payloadObj) return
    const blob = new Blob([rawContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payload-${payloadObj.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
    onExport?.(payloadObj.id)
  }

  if (!payloadObj) {
    return (
      <Card className="card-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground text-center">
            Select a payload to view details.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-300 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Payload viewer</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          {onReplay && (
            <Button
              size="sm"
              onClick={() => onReplay(payloadObj.id)}
              disabled={isReplaying}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isReplaying ? 'Replaying…' : 'Replay'}
            </Button>
          )}
        </div>

        {payloadObj.hash && (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="text-xs text-muted-foreground">Integrity hash: </span>
            <code className="font-mono text-xs break-all">{payloadObj.hash}</code>
          </div>
        )}

        <div className="rounded-md border border-border overflow-hidden">
          <ScrollArea className="h-[320px] w-full">
            <pre
              className={cn(
                'p-4 font-mono text-xs whitespace-pre-wrap break-words',
                'bg-muted/30'
              )}
            >
              {rawContent}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
