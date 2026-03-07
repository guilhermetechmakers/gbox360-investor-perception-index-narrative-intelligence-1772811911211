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
import { FileJson, FileText, Loader2, AlertCircle } from 'lucide-react'
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
  /** Optional error message to display (e.g. export failure) */
  error?: string | null
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
  error = null,
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
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Select format(s)</legend>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="export-format-json"
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-[box-shadow,border-color,background-color] duration-200',
                  'hover:bg-muted/50 hover:border-primary/20',
                  'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none',
                  wantJson && 'border-primary/40 bg-primary/5'
                )}
              >
                <Checkbox
                  id="export-format-json"
                  checked={wantJson}
                  onCheckedChange={(c) => setWantJson(c ? true : wantPdf ? false : true)}
                  aria-label="Include JSON format (machine-consumable)"
                />
                <FileJson className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-sm text-foreground">JSON (machine-consumable)</span>
              </label>
              <label
                htmlFor="export-format-pdf"
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-[box-shadow,border-color,background-color] duration-200',
                  'hover:bg-muted/50 hover:border-primary/20',
                  'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none',
                  wantPdf && 'border-primary/40 bg-primary/5'
                )}
              >
                <Checkbox
                  id="export-format-pdf"
                  checked={wantPdf}
                  onCheckedChange={(c) => setWantPdf(c ? true : wantJson ? false : true)}
                  aria-label="Include PDF format (human-readable)"
                />
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-sm text-foreground">PDF (human-readable)</span>
              </label>
            </div>
          </fieldset>
          {error ? (
            <div
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Artifacts include calculation inputs, narrative breakdown, event timeline, and integrity hashes.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
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
