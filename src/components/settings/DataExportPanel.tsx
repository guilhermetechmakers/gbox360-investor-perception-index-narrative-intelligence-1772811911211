import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataExport, useGdprExport } from '@/hooks/useSettings'
import { FileDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV (spreadsheet)' },
  { value: 'json', label: 'JSON (programmatic)' },
  { value: 'zip', label: 'ZIP (GDPR full export)' },
] as const

export function DataExportPanel() {
  const [format, setFormat] = useState<'csv' | 'json' | 'zip'>('csv')
  const exportData = useDataExport()
  const gdprExport = useGdprExport()

  const isGdpr = format === 'zip'
  const isExporting = exportData.isPending || (isGdpr && gdprExport.status === 'pending')
  const hasDownload = isGdpr && gdprExport.status === 'completed' && gdprExport.downloadUrl

  const handleExport = () => {
    if (isGdpr) {
      gdprExport.initiate()
    } else {
      exportData.mutate(format)
    }
  }

  const handleDownload = () => {
    if (gdprExport.downloadUrl) {
      window.open(gdprExport.downloadUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleReset = () => {
    gdprExport.reset()
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Data export
        </CardTitle>
        <CardDescription>
          Download a copy of your account data. CSV for spreadsheets, JSON for programmatic use, or
          ZIP for a full GDPR export including profile, preferences, saved companies, and audit data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export-format">Export format</Label>
          <Select
            value={format}
            onValueChange={(v) => {
              setFormat(v as 'csv' | 'json' | 'zip')
              gdprExport.reset()
            }}
          >
            <SelectTrigger id="export-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {(EXPORT_FORMATS ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isGdpr && gdprExport.status === 'pending' && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 animate-fade-in-up">
            <Loader2 className="h-5 w-5 animate-spin text-accent shrink-0" aria-hidden />
            <div>
              <p className="font-medium text-foreground">Preparing your export</p>
              <p className="text-sm text-muted-foreground">
                This may take a minute. We will poll for completion.
              </p>
            </div>
          </div>
        )}

        {isGdpr && gdprExport.status === 'completed' && hasDownload && (
          <div
            className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4 animate-fade-in-up"
            role="alert"
          >
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Export ready</p>
              <p className="text-sm text-muted-foreground">
                Your data has been prepared. Click below to download.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleDownload}
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                New export
              </Button>
            </div>
          </div>
        )}

        {isGdpr && gdprExport.status === 'failed' && gdprExport.error && (
          <div
            className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{gdprExport.error}</p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Try again
            </Button>
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExporting || (isGdpr && gdprExport.status === 'completed')}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isGdpr ? 'Preparing export…' : 'Preparing export…'}
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              {isGdpr ? 'Request GDPR export' : 'Download my data'}
            </>
          )}
        </Button>

        {isGdpr && (
          <p className="text-xs text-muted-foreground">
            GDPR export includes your profile, preferences, saved companies, provisional weights, and
            audit log. You will receive an email when the export is ready if notifications are
            enabled.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
