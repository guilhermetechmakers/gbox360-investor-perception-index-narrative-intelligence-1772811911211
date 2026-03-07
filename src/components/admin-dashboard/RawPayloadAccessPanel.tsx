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
import { EmptyState } from '@/components/profile/EmptyState'
import { Play, FileJson, ListFilter } from 'lucide-react'
import type { RawPayload } from '@/types/admin'

interface RawPayloadAccessPanelProps {
  payload?: RawPayload | null
  onReplay?: (id: string) => void
  /** When provided, empty state shows a primary CTA that calls this (e.g. focus/scroll to payload list). */
  onEmptyStateAction?: () => void
  isReplaying?: boolean
}

export function RawPayloadAccessPanel({
  payload = null,
  onReplay,
  onEmptyStateAction,
  isReplaying = false,
}: RawPayloadAccessPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEmptyStateCta = () => {
    if (onEmptyStateAction) {
      onEmptyStateAction()
      return
    }
    const el = document.getElementById('payload-list')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!payload) {
    return (
      <Card
        className="card-surface transition-all duration-300"
        aria-label="Payload provenance - no selection"
      >
        <CardContent className="p-6">
          <EmptyState
            icon={<FileJson className="h-6 w-6 text-muted-foreground" aria-hidden />}
            title="No payload selected"
            description="Select a payload from the list to view provenance and replay options."
            action={
              <Button
                variant="default"
                size="sm"
                onClick={handleEmptyStateCta}
                className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Select a payload from the list"
              >
                <ListFilter className="mr-2 h-4 w-4" aria-hidden />
                Select a payload
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  const provenance = payload.provenance ?? {}
  const provenanceKeys = Object.keys(provenance)

  return (
    <>
      <Card
        className="card-surface transition-all duration-300"
        aria-label="Payload provenance"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Payload provenance
          </CardTitle>
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowConfirm(true)}
            disabled={isReplaying}
            className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Play className="mr-2 h-4 w-4" />
            {isReplaying ? 'Replaying…' : 'Replay ingestion'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-foreground">
              {payload.source ?? 'unknown'}
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground">
              {new Date(payload.timestamp).toLocaleString()}
            </Badge>
            {provenanceKeys.slice(0, 5).map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="font-mono text-xs border-border text-muted-foreground"
              >
                {k}: {String((provenance as Record<string, unknown>)[k] ?? '').slice(0, 20)}
              </Badge>
            ))}
          </div>
          {provenanceKeys.length > 0 && (
            <pre className="text-xs rounded-lg border border-border bg-muted/30 text-foreground p-3 overflow-auto max-h-32">
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
