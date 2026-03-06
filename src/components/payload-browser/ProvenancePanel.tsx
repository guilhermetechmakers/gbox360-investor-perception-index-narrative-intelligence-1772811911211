import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProvenanceData } from '@/types/admin'

interface ProvenancePanelProps {
  provenanceData: ProvenanceData | null | undefined
}

export function ProvenancePanel({ provenanceData }: ProvenancePanelProps) {
  const data = provenanceData ?? {}
  const events = Array.isArray(data?.events) ? data.events : []

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Provenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.provenanceChain && (
          <p className="text-sm text-muted-foreground mb-4">
            {data.provenanceChain}
          </p>
        )}

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No provenance events available.
          </p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {events.map((evt, idx) => (
                <div
                  key={evt.id ?? idx}
                  className={cn(
                    'rounded-md border border-border p-3 text-sm',
                    'bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {evt.eventId ?? evt.id}
                    </Badge>
                    {evt.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {evt.eventData && Object.keys(evt.eventData).length > 0 && (
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-24">
                      {JSON.stringify(evt.eventData, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {events.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Replay is idempotent via external_id + content_hash.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
