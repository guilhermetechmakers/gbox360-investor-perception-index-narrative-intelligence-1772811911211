import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { RawPayloadAccessPanel } from '@/components/admin-dashboard'
import { usePayloads, useReplayPayload } from '@/hooks/useAdminDashboard'
import { FileJson, Download, Search } from 'lucide-react'
import type { RawPayload } from '@/types/admin'

export function RawPayloadBrowser() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayload, setSelectedPayload] = useState<RawPayload | null>(null)

  const { data: payloadsData } = usePayloads({ limit: 20 })
  const replayPayload = useReplayPayload()
  const payloads = payloadsData?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Raw payload browser</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">Back to overview</Link>
          </Button>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                {payloads.length === 0 ? (
                  <>
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
                          timestamp: new Date().toISOString(),
                          provenance: { source: 'news', external_id: 'sample-1' },
                        })
                      }
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Open sample
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    {(payloads ?? []).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPayload(p)}
                        className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium">{p.source ?? p.id}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {new Date(p.timestamp).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <RawPayloadAccessPanel
            payload={selectedPayload}
            onReplay={(id) => replayPayload.mutate(id)}
            isReplaying={replayPayload.isPending}
          />
        </div>
      </div>

      <Dialog open={!!selectedPayload} onOpenChange={() => setSelectedPayload(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Payload viewer</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap break-words">
              {selectedPayload != null
                ? JSON.stringify(
                    {
                      id: selectedPayload.id,
                      source: selectedPayload.source,
                      timestamp: selectedPayload.timestamp,
                      provenance: selectedPayload.provenance,
                      rawPayload: selectedPayload.rawPayload,
                    },
                    null,
                    2
                  )
                : ''}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
