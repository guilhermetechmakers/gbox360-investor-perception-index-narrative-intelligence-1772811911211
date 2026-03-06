import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { JsonHighlight } from './JsonHighlight'

interface RawPayloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payload: unknown
  isLoading?: boolean
  movementId?: string
  narrativeTitle?: string
  eventCount?: number
  eventId?: string
  provenance?: { documentId?: string; url?: string } | null
}

export function RawPayloadModal({
  open,
  onOpenChange,
  payload,
  isLoading,
  movementId,
  narrativeTitle,
  eventCount,
  eventId,
  provenance,
}: RawPayloadModalProps) {
  const payloadObj =
    payload != null && typeof payload === 'object'
      ? payload
      : payload != null
        ? { raw: payload }
        : null

  const handleCopy = () => {
    if (payloadObj == null) return
    const text = JSON.stringify(payloadObj, null, 2)
    navigator.clipboard.writeText(text).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  const handleDownload = () => {
    if (payloadObj == null) return
    const blob = new Blob([JSON.stringify(payloadObj, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payload-${eventId ?? 'unknown'}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Raw Payload</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="payload" className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="payload" className="flex-1 min-h-0 mt-4">
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!payloadObj || isLoading}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!payloadObj || isLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
            <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs min-h-[200px]">
              {isLoading && <Skeleton className="h-32 w-full" />}
              {!isLoading && payloadObj != null && (
                <JsonHighlight
                  content={JSON.stringify(payloadObj)}
                  className="whitespace-pre-wrap break-words"
                />
              )}
              {!isLoading && payloadObj == null && (
                <p className="text-muted-foreground">No payload available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3 text-sm">
              {movementId && (
                <div>
                  <span className="text-muted-foreground">Movement ID:</span>{' '}
                  {movementId}
                </div>
              )}
              {narrativeTitle && (
                <div>
                  <span className="text-muted-foreground">Narrative:</span>{' '}
                  {narrativeTitle}
                </div>
              )}
              {eventCount != null && (
                <div>
                  <span className="text-muted-foreground">Event count:</span>{' '}
                  {eventCount}
                </div>
              )}
              {eventId && (
                <div>
                  <span className="text-muted-foreground">Event ID:</span>{' '}
                  {eventId}
                </div>
              )}
              {provenance && (
                <div>
                  <span className="text-muted-foreground">Provenance:</span>
                  <ul className="mt-1 list-disc list-inside text-muted-foreground">
                    {provenance.documentId && (
                      <li>Document: {provenance.documentId}</li>
                    )}
                    {provenance.url && <li>URL: {provenance.url}</li>}
                  </ul>
                </div>
              )}
              {!movementId && !narrativeTitle && !eventId && !provenance && (
                <p className="text-muted-foreground">No metadata available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
