/**
 * Audit Export Modal - prompts for scope and format, triggers server-side export
 */

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FileJson, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { auditExportApi } from '@/api/audit-export'
import {
  downloadArtifactFromServer,
  downloadPDF,
  toAuditInput,
} from '@/lib/audit-export'
import type { IPIViewContext } from '@/types/company-view'
import type { IPIArtifactExportResponse } from '@/types/audit-export'
import { ensureArray } from '@/lib/runtime-safe'

type ExportFormat = 'json' | 'pdf' | 'both'

interface AuditExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewContext: IPIViewContext
  narrativeId?: string
  includeNarratives?: string[]
}

export function AuditExportModal({
  open,
  onOpenChange,
  viewContext,
  narrativeId,
  includeNarratives: initialNarratives = [],
}: AuditExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('both')
  const [isExporting, setIsExporting] = useState(false)
  const [result, setResult] = useState<IPIArtifactExportResponse | null>(null)
  const [selectedNarratives, setSelectedNarratives] = useState<Set<string>>(
    () => new Set(ensureArray(initialNarratives))
  )

  const narratives = ensureArray(viewContext.narratives)
  const narrativeIds = narratives.map((n) => n.narrativeId).filter(Boolean)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    setResult(null)
    try {
      const res = await auditExportApi.requestIPIArtifact({
        companyId: viewContext.companyId,
        windowStart: viewContext.windowStart,
        windowEnd: viewContext.windowEnd,
        narrativeId: narrativeId ?? undefined,
        includeNarratives:
          selectedNarratives.size > 0
            ? Array.from(selectedNarratives)
            : narrativeIds.slice(0, 3),
        format,
      })

      setResult(res)

      if (res.status === 'ready') {
        if ((format === 'json' || format === 'both') && res.artifactJson) {
          downloadArtifactFromServer(
            res.artifactJson,
            viewContext.companyId,
            viewContext.windowStart,
            viewContext.windowEnd
          )
        }
        if (format === 'pdf' || format === 'both') {
          const input = toAuditInput(viewContext)
          downloadPDF(input)
        }
        toast.success('Audit artifacts downloaded')
      } else if (res.status === 'failed') {
        toast.error(res.message ?? 'Export failed')
      } else {
        toast.info(res.message ?? 'Export in progress')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
      setResult(null)
    } finally {
      setIsExporting(false)
    }
  }, [
    viewContext,
    narrativeId,
    selectedNarratives,
    narrativeIds,
    format,
  ])

  const handleClose = useCallback(() => {
    setResult(null)
    onOpenChange(false)
  }, [onOpenChange])

  const toggleNarrative = (id: string) => {
    setSelectedNarratives((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedNarratives(new Set(narrativeIds))
  }

  const selectNone = () => {
    setSelectedNarratives(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="export-desc">
        <DialogHeader>
          <DialogTitle>Export Audit Artifacts</DialogTitle>
          <DialogDescription id="export-desc">
            Generate signed artifacts with calculation inputs, provenance, and
            integrity hashes. Select scope and format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={format === 'json'}
                  onCheckedChange={() => setFormat('json')}
                  aria-label="JSON only"
                />
                <FileJson className="h-4 w-4" />
                <span className="text-sm">JSON</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={format === 'pdf'}
                  onCheckedChange={() => setFormat('pdf')}
                  aria-label="PDF only"
                />
                <FileText className="h-4 w-4" />
                <span className="text-sm">PDF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={format === 'both'}
                  onCheckedChange={() => setFormat('both')}
                  aria-label="Both JSON and PDF"
                />
                <span className="text-sm">Both</span>
              </label>
            </div>
          </div>

          {narrativeIds.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Narrative scope</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="h-8 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectNone}
                    className="h-8 text-xs"
                  >
                    None
                  </Button>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-md border border-border p-3 space-y-2">
                {narrativeIds.map((id) => {
                  const n = narratives.find((x) => x.narrativeId === id)
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selectedNarratives.has(id)}
                        onCheckedChange={() => toggleNarrative(id)}
                      />
                      <span className="truncate">{n?.name ?? id}</span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for top 3 narratives
              </p>
            </div>
          )}

          {result?.status === 'ready' && (
            <div className="flex items-center gap-2 rounded-md bg-success/10 text-success px-3 py-2 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Export ready. Downloads started.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-[#93C5FD]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting…
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
