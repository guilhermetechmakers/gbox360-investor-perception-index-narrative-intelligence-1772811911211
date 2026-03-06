import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEvent } from '@/types/admin'

interface NarrativeEventProvenanceCardProps {
  event?: NarrativeEvent | null
  onSignArtifact?: (eventId: string) => void
  isSigning?: boolean
}

export function NarrativeEventProvenanceCard({
  event = null,
  onSignArtifact,
  isSigning = false,
}: NarrativeEventProvenanceCardProps) {
  if (!event) {
    return (
      <Card className="card-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Select a NarrativeEvent to view provenance and sign artifacts.
          </p>
        </CardContent>
      </Card>
    )
  }

  const timestamps = event.timestamps ?? {}
  const timestampKeys = Object.keys(timestamps)

  return (
    <Card className="card-surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">NarrativeEvent provenance</CardTitle>
        {event.signedArtifactUrl && (
          <Badge variant="success">Signed</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{event.source ?? '—'}</Badge>
          <Badge variant="outline">{event.speaker ?? '—'}</Badge>
          <Badge variant="outline">{event.audience ?? '—'}</Badge>
          {timestampKeys.slice(0, 3).map((k) => (
            <Badge key={k} variant="outline" className="font-mono text-xs">
              {k}: {(timestamps as Record<string, string>)[k] ?? '—'}
            </Badge>
          ))}
        </div>
        {event.raw_text && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.raw_text}
          </p>
        )}
        {onSignArtifact && !event.signedArtifactUrl && (
          <button
            type="button"
            onClick={() => onSignArtifact(event.id)}
            disabled={isSigning}
            className={cn(
              'text-sm font-medium text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
              isSigning && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSigning ? 'Signing…' : 'Generate signed audit artifact'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
