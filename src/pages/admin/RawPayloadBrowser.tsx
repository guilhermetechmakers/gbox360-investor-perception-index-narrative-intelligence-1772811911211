import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileJson, Download, Search } from 'lucide-react'

export function RawPayloadBrowser() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayload, setSelectedPayload] = useState<unknown>(null)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Raw payload browser</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export artifact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payloads</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
              Append-only store. Use filters and open a payload to view JSON. Replay and retention
              controls available for operators.
            </p>
            <div className="mt-4 rounded-md border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                No payloads loaded. Connect to API and add filters to list payloads.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setSelectedPayload({
                    id: 'sample',
                    source: 'news',
                    ingested_at: new Date().toISOString(),
                    body: { title: 'Sample', content: '...' },
                  })
                }
              >
                <FileJson className="mr-2 h-4 w-4" />
                Open sample
              </Button>
            </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayload} onOpenChange={() => setSelectedPayload(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Payload viewer</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap break-words">
              {selectedPayload != null
                ? JSON.stringify(selectedPayload, null, 2)
                : ''}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
