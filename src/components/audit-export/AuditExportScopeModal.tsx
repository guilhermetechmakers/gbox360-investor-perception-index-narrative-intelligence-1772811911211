/**
 * Modal for selecting audit export scope and format (JSON/PDF)
 * Prompts user for format before initiating artifact generation
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FileJson, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ExportFormat = 'json' | 'pdf' | 'both'

interface AuditExportScopeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (format: ExportFormat) => void
  isExporting?: boolean
  companyName?: string
  windowStart: string
  windowEnd: string
}

function deriveFormat(wantJson: boolean, wantPdf: boolean): ExportFormat {
  if (wantJson && wantPdf) return 'both'
  if (wantPdf) return 'pdf'
  return 'json'
}

export function AuditExportScopeModal({
  open,
  onOpenChange,
  onConfirm,
  isExporting = false,
  companyName,
  windowStart,
  windowEnd,
}: AuditExportScopeModalProps) {
  const [wantJson, setWantJson] = useState(true)
  const [wantPdf, setWantPdf] = useState(true)

  const format = deriveFormat(wantJson, wantPdf)

  const handleConfirm = () => {
    onConfirm(format)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby="export-scope-title"
        aria-describedby="export-scope-desc"
      >
        <DialogHeader>
          <DialogTitle id="export-scope-title">Export Audit Artifacts</DialogTitle>
          <DialogDescription id="export-scope-desc">
            {companyName ? (
              <>Generate signed artifacts for {companyName} ({windowStart} – {windowEnd})</>
            ) : (
              <>Generate signed artifacts for {windowStart} – {windowEnd}</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm font-medium">Select format(s)</p>
          <div className="flex flex-col gap-3">
            <label
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-all duration-200',
                'hover:bg-muted/50 hover:border-primary/20',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                wantJson && 'border-primary/40 bg-primary/5'
              )}
            >
              <Checkbox
                checked={wantJson}
                onCheckedChange={(c) => setWantJson(c ? true : wantPdf ? false : true)}
              />
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">JSON (machine-consumable)</span>
            </label>
            <label
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-all duration-200',
                'hover:bg-muted/50 hover:border-primary/20',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                wantPdf && 'border-primary/40 bg-primary/5'
              )}
            >
              <Checkbox
                checked={wantPdf}
                onCheckedChange={(c) => setWantPdf(c ? true : wantJson ? false : true)}
              />
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">PDF (human-readable)</span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Artifacts include calculation inputs, narrative breakdown, event timeline, and integrity hashes.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isExporting}
            className="bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary))]/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
