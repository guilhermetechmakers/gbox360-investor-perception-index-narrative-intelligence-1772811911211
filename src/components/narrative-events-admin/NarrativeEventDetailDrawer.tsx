import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { JsonHighlight } from '@/components/drilldown/JsonHighlight'
import type { CanonicalNarrativeEvent } from '@/types/narrative-event-canonical'

interface NarrativeEventDetailDrawerProps {
  event: CanonicalNarrativeEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function provenanceDisplay(provenance: unknown): string {
  if (provenance == null || typeof provenance !== 'object') return '{}'
  return JSON.stringify(provenance, null, 2)
}

export function NarrativeEventDetailDrawer({
  event,
  open,
  onOpenChange,
}: NarrativeEventDetailDrawerProps) {
  if (!event) return null

  const rawText = event.raw_text ?? ''
  const provenance = event.provenance ?? {}
  const metadata = event.metadata ?? {}

  const handleCopy = () => {
    const payload = {
      event_id: event.event_id,
      raw_payload_id: event.raw_payload_id,
      source: event.source,
      platform: event.platform,
      speaker_entity: event.speaker_entity,
      speaker_role: event.speaker_role,
      audience_class: event.audience_class,
      raw_text: rawText,
      ingestion_timestamp: event.ingestion_timestamp,
      original_timestamp: event.original_timestamp,
      metadata,
      authority_score: event.authority_score,
      credibility_flags: event.credibility_flags,
      provenance,
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  const handleDownload = () => {
    const payload = {
      event_id: event.event_id,
      raw_payload_id: event.raw_payload_id,
      source: event.source,
      platform: event.platform,
      speaker_entity: event.speaker_entity,
      speaker_role: event.speaker_role,
      audience_class: event.audience_class,
      raw_text: rawText,
      ingestion_timestamp: event.ingestion_timestamp,
      original_timestamp: event.original_timestamp,
      metadata,
      authority_score: event.authority_score,
      credibility_flags: event.credibility_flags,
      provenance,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `narrative-event-${event.event_id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download started')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Narrative Event Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Event ID</p>
            <p className="font-mono text-sm">{event.event_id}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Raw payload ID</p>
            <p className="font-mono text-sm">{event.raw_payload_id}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Raw text</p>
            <p className="text-sm whitespace-pre-wrap break-words rounded-md border border-border bg-muted/30 p-3">
              {rawText || '—'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Provenance</p>
            <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs overflow-auto max-h-40">
              <JsonHighlight content={provenanceDisplay(provenance)} className="whitespace-pre-wrap break-words" />
            </div>
          </div>

          {Object.keys(metadata).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Metadata</p>
              <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs overflow-auto max-h-32">
                <JsonHighlight content={JSON.stringify(metadata, null, 2)} className="whitespace-pre-wrap break-words" />
              </div>
            </div>
          )}

          {event.authority_score != null && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Authority score</p>
              <p className="text-sm">{(event.authority_score * 100).toFixed(1)}%</p>
            </div>
          )}

          {event.credibility_flags != null && Object.keys(event.credibility_flags).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Credibility flags</p>
              <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
                <JsonHighlight content={JSON.stringify(event.credibility_flags, null, 2)} className="whitespace-pre-wrap break-words" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
