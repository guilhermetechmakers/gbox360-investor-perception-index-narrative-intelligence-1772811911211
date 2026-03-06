import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rss, Twitter, FileText, Play, AlertCircle } from 'lucide-react'

const SOURCES = [
  { id: 'news', name: 'NewsAPI', icon: Rss, lastFetch: '2 min ago', items: 120, errors: 0 },
  { id: 'social', name: 'X / Twitter', icon: Twitter, lastFetch: '5 min ago', items: 340, errors: 0 },
  { id: 'transcript', name: 'Earnings transcripts', icon: FileText, lastFetch: 'Manual', items: 0, errors: 0 },
]

export function IngestMonitor() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Ingest monitor</h1>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Trigger transcript import
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SOURCES.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <s.icon className="h-4 w-4" />
                {s.name}
              </CardTitle>
              <Badge variant={s.errors > 0 ? 'destructive' : 'success'}>
                {s.errors > 0 ? `${s.errors} errors` : 'OK'}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Last fetch: {s.lastFetch}</p>
              <p className="text-sm font-medium mt-1">{s.items} items</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetchers → Normalizer (idempotency: external_id + content_hash) → NarrativeEvent store.
              DLQ and replay available in Raw Payload Browser.
            </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent error log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent errors.</p>
        </CardContent>
      </Card>
    </div>
  )
}
