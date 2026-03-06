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
import { useDataExport } from '@/hooks/useSettings'
import { FileDown, Loader2 } from 'lucide-react'

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
] as const

export function DataExportPanel() {
  const exportData = useDataExport()
  const [format, setFormat] = useState<'csv' | 'json'>('csv')

  const handleExport = () => {
    exportData.mutate(format)
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Data export
        </CardTitle>
        <CardDescription>
          Download a copy of your account data. Choose CSV for spreadsheets or JSON for
          programmatic use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export-format">Export format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
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
        <Button
          onClick={handleExport}
          disabled={exportData.isPending}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {exportData.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing export…
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download my data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
