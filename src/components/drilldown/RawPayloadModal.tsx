import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/profile/EmptyState'
import { Download, Copy, FileStack, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
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
  const [activeTab, setActiveTab] = useState<'payload' | 'metadata'>('payload')
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    if (!open) setActiveTab('payload')
  }, [open])

  const payloadObj =
    payload != null && typeof payload === 'object'
      ? payload
      : payload != null
        ? { raw: payload }
        : null

  const hasProvenance =
    provenance &&
    (provenance.documentId != null ||
      provenance.url != null)
  const hasAnyMetadata = Boolean(
    movementId ||
      narrativeTitle ||
      (eventCount != null) ||
      eventId ||
      hasProvenance
  )

  const handleCopy = async () => {
    if (payloadObj == null) return
    setCopyLoading(true)
    try {
      const text = JSON.stringify(payloadObj, null, 2)
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    } finally {
      setCopyLoading(false)
    }
  }

  const handleDownload = () => {
    if (payloadObj == null) return
    setDownloadLoading(true)
    try {
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
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-labelledby="raw-payload-modal-title"
        aria-describedby="raw-payload-modal-desc"
      >
        <DialogHeader>
          <DialogTitle id="raw-payload-modal-title">Raw Payload</DialogTitle>
        </DialogHeader>
        <p id="raw-payload-modal-desc" className="sr-only">
          View raw JSON payload and metadata for this event
        </p>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v === 'metadata' ? 'metadata' : 'payload')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList
            className="bg-muted border border-border rounded-lg p-1"
            role="tablist"
            aria-label="Payload and metadata tabs"
          >
            <TabsTrigger value="payload">
              Payload
            </TabsTrigger>
            <TabsTrigger value="metadata">
              Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payload" className="flex-1 min-h-0 mt-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!payloadObj || isLoading || copyLoading}
                className="gap-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={copyLoading ? 'Copying payload…' : 'Copy payload to clipboard'}
                aria-busy={copyLoading}
              >
                {copyLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copyLoading ? 'Copying…' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!payloadObj || isLoading || downloadLoading}
                className="gap-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={downloadLoading ? 'Downloading…' : 'Download payload as JSON file'}
                aria-busy={downloadLoading}
              >
                {downloadLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                {downloadLoading ? 'Downloading…' : 'Download'}
              </Button>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm min-h-[200px] shadow-sm">
              {isLoading && <Skeleton className="h-32 w-full rounded-md" />}
              {!isLoading && payloadObj != null && (
                <JsonHighlight
                  content={JSON.stringify(payloadObj)}
                  className="whitespace-pre-wrap break-words text-foreground"
                />
              )}
              {!isLoading && payloadObj == null && (
                <p className="text-muted-foreground">No payload available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 min-h-[200px] flex flex-col shadow-sm">
              {hasAnyMetadata ? (
                <div className="p-4 space-y-3 text-sm text-foreground">
                  {movementId && (
                    <div>
                      <span className="text-muted-foreground">Movement ID:</span>{' '}
                      <span className="text-foreground">{movementId}</span>
                    </div>
                  )}
                  {narrativeTitle && (
                    <div>
                      <span className="text-muted-foreground">Narrative:</span>{' '}
                      <span className="text-foreground">{narrativeTitle}</span>
                    </div>
                  )}
                  {eventCount != null && (
                    <div>
                      <span className="text-muted-foreground">Event count:</span>{' '}
                      <span className="text-foreground">{eventCount}</span>
                    </div>
                  )}
                  {eventId && (
                    <div>
                      <span className="text-muted-foreground">Event ID:</span>{' '}
                      <span className="text-foreground">{eventId}</span>
                    </div>
                  )}
                  {hasProvenance && provenance && (
                    <div>
                      <span className="text-muted-foreground">Provenance:</span>
                      <ul className="mt-1 list-disc list-inside text-muted-foreground">
                        {provenance.documentId != null && (
                          <li className="text-foreground">Document: {provenance.documentId}</li>
                        )}
                        {provenance.url != null && (
                          <li className="text-foreground">URL: {provenance.url}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<FileStack className="h-6 w-6 text-muted-foreground" aria-hidden />}
                  title="No metadata available"
                  description="Movement ID, narrative, event details, and provenance for this payload are not present. They may be added when the event is fully processed."
                  className="py-12 px-4"
                  action={
                    <Button
                      variant="default"
                      size="sm"
                      className="transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => setActiveTab('payload')}
                      aria-label="Switch to Payload tab to view raw JSON"
                    >
                      View payload
                    </Button>
                  }
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
