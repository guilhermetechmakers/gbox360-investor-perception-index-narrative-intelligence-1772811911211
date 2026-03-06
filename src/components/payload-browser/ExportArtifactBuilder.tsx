import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { FileDown, Loader2 } from 'lucide-react'

interface ExportArtifactBuilderProps {
  selectedNarrativeEvents: { id: string; [key: string]: unknown }[]
  onGenerateExport: (params: {
    narrativeEventIds: string[]
    signingMethod: string
    exportFormat: 'json' | 'pdf'
  }) => void
  isGenerating?: boolean
}

const SIGNING_METHODS = [
  { value: 'hmac', label: 'HMAC-SHA256' },
  { value: 'pki', label: 'PKI (KMS)' },
]

export function ExportArtifactBuilder({
  selectedNarrativeEvents = [],
  onGenerateExport,
  isGenerating = false,
}: ExportArtifactBuilderProps) {
  const [signingMethod, setSigningMethod] = useState('hmac')
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf'>('json')

  const events = Array.isArray(selectedNarrativeEvents) ? selectedNarrativeEvents : []
  const ids = events
    .map((e) => (e?.id != null ? String(e.id) : null))
    .filter((x): x is string => !!x)
  const canExport = ids.length > 0 && !isGenerating

  const handleGenerate = () => {
    if (!canExport) return
    onGenerateExport({
      narrativeEventIds: ids,
      signingMethod,
      exportFormat,
    })
  }

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileDown className="h-4 w-4 text-muted-foreground" />
          Export artifact builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Selected: </span>
          <span className="font-medium">{ids.length} narrative event(s)</span>
        </div>

        {ids.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Select NarrativeEvents from the payload or drilldown to build an export.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Signing method</Label>
              <Select value={signingMethod} onValueChange={setSigningMethod}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIGNING_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Artifact type</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as 'json' | 'pdf')}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (signed)</SelectItem>
                  <SelectItem value="pdf">PDF (human-readable)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={66} className="h-2" />
                <p className="text-xs text-muted-foreground">Generating export…</p>
              </div>
            )}
            <Button
              className="w-full gap-2"
              disabled={!canExport}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Generate export
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
