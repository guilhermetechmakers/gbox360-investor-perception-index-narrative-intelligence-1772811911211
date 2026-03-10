import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRawPayload } from '@/hooks/useIPI'
import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

interface RawPayloadViewerProps {
  rawPayloadId: string | null
  onClose: () => void
}

export function RawPayloadViewer({ rawPayloadId, onClose }: RawPayloadViewerProps) {
  const { data: payload, isLoading } = useRawPayload(rawPayloadId ?? '')

  const handleCopy = () => {
    if (payload == null) return
    const text = JSON.stringify(payload, null, 2)
    navigator.clipboard.writeText(text).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  const handleDownload = () => {
    if (payload == null) return
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `raw-payload-${rawPayloadId ?? 'unknown'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  return (
    <Dialog open={!!rawPayloadId} onOpenChange={(open) => !open && onClose()} aria-labelledby="raw-payload-dialog-title" aria-describedby="raw-payload-dialog-desc">
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle id="raw-payload-dialog-title">Raw Payload</DialogTitle>
        </DialogHeader>
        <p id="raw-payload-dialog-desc" className="sr-only">
          View and copy raw event payload JSON for auditability.
        </p>
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!payload}
            className="gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Copy payload to clipboard"
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!payload}
            className="gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Download payload as JSON file"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 p-6 font-mono text-xs min-h-[200px] shadow-md" role="region" aria-label="Payload content">
          {isLoading && <Skeleton className="h-32 w-full" aria-hidden />}
          {!isLoading && payload != null && (
            <pre className="whitespace-pre-wrap break-words text-foreground">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
          {!isLoading && payload == null && rawPayloadId && (
            <p className="text-foreground/80" role="status">Payload not found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
