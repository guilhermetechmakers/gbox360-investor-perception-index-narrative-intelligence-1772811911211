import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FileDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEvent } from '@/types/admin'

interface AuditArtifactSignerPanelProps {
  events?: NarrativeEvent[]
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  onSignAndDownload?: (ids: string[]) => void
  isSigning?: boolean
}

export function AuditArtifactSignerPanel({
  events = [],
  selectedIds = new Set(),
  onSelectionChange,
  onSignAndDownload,
  isSigning = false,
}: AuditArtifactSignerPanelProps) {
  const items = Array.isArray(events) ? events : []
  const selected = selectedIds ?? new Set<string>()

  const handleToggle = (id: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectionChange?.(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(new Set(items.map((e) => e.id)))
    } else {
      onSelectionChange?.(new Set())
    }
  }

  const handleSign = () => {
    const ids = Array.from(selected)
    if (ids.length > 0) onSignAndDownload?.(ids)
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Sign audit artifacts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select NarrativeEvents to generate signed JSON + PDF artifacts with integrity hashes.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No NarrativeEvents to sign.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a company and time window to load events.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={selected.size === items.length && items.length > 0}
                  onCheckedChange={(c) => handleSelectAll(!!c)}
                />
                Select all ({items.length})
              </label>
              <Button
                size="sm"
                onClick={handleSign}
                disabled={selected.size === 0 || isSigning}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {isSigning ? 'Signing…' : `Sign & download (${selected.size})`}
              </Button>
            </div>
            <div className="max-h-48 overflow-auto space-y-2 rounded-lg border border-border p-2">
              {items.slice(0, 20).map((e) => (
                <label
                  key={e.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer',
                    'hover:bg-muted/50 transition-colors'
                  )}
                >
                  <Checkbox
                    checked={selected.has(e.id)}
                    onCheckedChange={(c) => handleToggle(e.id, !!c)}
                  />
                  <span className="text-sm truncate flex-1">
                    {e.source ?? '—'} · {e.speaker ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {e.timestamps?.original_timestamp
                      ? new Date(e.timestamps.original_timestamp).toLocaleDateString()
                      : '—'}
                  </span>
                </label>
              ))}
              {items.length > 20 && (
                <p className="text-xs text-muted-foreground px-2">
                  +{items.length - 20} more. Use filters to narrow selection.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
