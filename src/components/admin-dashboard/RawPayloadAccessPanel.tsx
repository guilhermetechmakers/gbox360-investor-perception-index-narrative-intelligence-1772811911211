import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Play, FileJson } from 'lucide-react'
import type { RawPayload } from '@/types/admin'

interface RawPayloadAccessPanelProps {
  payload?: RawPayload | null
  onReplay?: (id: string) => void
  isReplaying?: boolean
}

export function RawPayloadAccessPanel({
  payload = null,
  onReplay,
  isReplaying = false,
}: RawPayloadAccessPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (!payload) {
    return (
      <Card className="card-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Select a payload to view provenance and replay options.
          </p>
        </CardContent>
      </Card>
    )
  }

  const provenance = payload.provenance ?? {}
  const provenanceKeys = Object.keys(provenance)

  return (
    <>
      <Card className="card-surface">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payload provenance</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={isReplaying}
          >
            <Play className="mr-2 h-4 w-4" />
            {isReplaying ? 'Replaying…' : 'Replay ingestion'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{payload.source ?? 'unknown'}</Badge>
            <Badge variant="outline">
              {new Date(payload.timestamp).toLocaleString()}
            </Badge>
            {provenanceKeys.slice(0, 5).map((k) => (
              <Badge key={k} variant="outline" className="font-mono text-xs">
                {k}: {String((provenance as Record<string, unknown>)[k] ?? '').slice(0, 20)}
              </Badge>
            ))}
          </div>
          {provenanceKeys.length > 0 && (
            <pre className="text-xs rounded-md border border-border bg-muted/30 p-3 overflow-auto max-h-32">
              {JSON.stringify(provenance, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replay ingestion</AlertDialogTitle>
            <AlertDialogDescription>
              This will replay the selected payload through the normalization pipeline.
              Idempotency is enforced via external_id + content_hash. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReplay?.(payload.id)
                setShowConfirm(false)
              }}
              disabled={isReplaying}
            >
              {isReplaying ? 'Replaying…' : 'Replay'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
