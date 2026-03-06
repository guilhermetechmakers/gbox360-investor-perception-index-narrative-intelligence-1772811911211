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
    <Dialog open={!!rawPayloadId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Raw Payload</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!payload}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!payload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
        <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs min-h-[200px]">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && payload != null && (
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
          {!isLoading && payload == null && rawPayloadId && (
            <p className="text-muted-foreground">Payload not found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
