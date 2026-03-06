import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuditArtifactSignerPanel } from '@/components/admin-dashboard'
import { AuditArtifactExporterButton } from '@/components/shared/AuditArtifactExporterButton'
import { PDFPreviewOrDownloadRow } from '@/components/shared/PDFPreviewOrDownloadRow'
import { EmptyState } from '@/components/profile/EmptyState'
import { useSignEvents } from '@/hooks/useAdminDashboard'
import { toast } from 'sonner'
import { FileDown, ArrowLeft } from 'lucide-react'
import type { NarrativeEvent } from '@/types/admin'
import type { ExportIPIArtifactResponse } from '@/types/export'
import type { IPIViewContext } from '@/types/company-view'

/** Inline form errors for export/filter fields */
interface FormErrors {
  companyId?: string
  timeFrom?: string
  timeTo?: string
}

function validateExportForm(companyId: string, timeFrom: string, timeTo: string): FormErrors {
  const errors: FormErrors = {}
  const trimmed = (companyId ?? '').trim()
  if (!trimmed) {
    errors.companyId = 'Company ID is required for export.'
  }
  if (timeFrom && timeTo && timeFrom > timeTo) {
    errors.timeFrom = 'From date must be before or equal to To date.'
    errors.timeTo = 'To date must be after or equal to From date.'
  }
  return errors
}

/** Mock NarrativeEvents for MVP - replace with API when available */
const MOCK_EVENTS: NarrativeEvent[] = []

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditExports() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [companyId, setCompanyId] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [recentExports, setRecentExports] = useState<ExportIPIArtifactResponse[]>([])
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const signEvents = useSignEvents()
  const events = MOCK_EVENTS

  const validateForm = useCallback(() => {
    const errors = validateExportForm(companyId, timeFrom, timeTo)
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [companyId, timeFrom, timeTo])

  const viewContext: IPIViewContext = useMemo(
    () => ({
      companyId: companyId || 'unknown',
      companyName: companyId,
      windowStart: timeFrom || new Date().toISOString().slice(0, 10),
      windowEnd: timeTo || new Date().toISOString().slice(0, 10),
      ipi: 0,
      delta: 0,
      direction: 'flat',
      breakdown: { narrative: 0.4, credibility: 0.4, risk: 0.2 },
      narratives: [],
      events: [],
    }),
    [companyId, timeFrom, timeTo]
  )

  const handleSignAndDownload = async (ids: string[]) => {
    try {
      const res = await signEvents.mutateAsync({
        narrativeEventIds: ids,
        companyId: companyId || undefined,
        timeWindow:
          timeFrom && timeTo
            ? { from: timeFrom, to: timeTo }
            : undefined,
      })
      const artifacts = res?.artifacts ?? []
      if (artifacts.length > 0 && artifacts[0]?.artifactUrl) {
        const a = await fetch(artifacts[0].artifactUrl!)
        const blob = await a.blob()
        downloadBlob(blob, `audit-artifact-${new Date().toISOString().slice(0, 10)}.json`)
        toast.success('Audit artifact downloaded')
      } else {
        const json = JSON.stringify({ artifacts, signedAt: new Date().toISOString() }, null, 2)
        downloadBlob(new Blob([json], { type: 'application/json' }), `audit-artifact-${new Date().toISOString().slice(0, 10)}.json`)
        toast.success('Audit artifact generated (JSON)')
      }
      setSelectedIds(new Set())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign events')
    }
  }

  const handleExportSuccess = (result: ExportIPIArtifactResponse) => {
    setRecentExports((prev) => [result, ...prev.slice(0, 4)])
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Audit exports</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg">IPI Artifact Export</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate signed JSON and PDF artifacts for a company and time window. Uses server-side
            signing when available.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="audit-export-company-id">Company ID</Label>
              <Input
                id="audit-export-company-id"
                placeholder="e.g. AAPL"
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value)
                  if (formErrors.companyId) setFormErrors((prev) => ({ ...prev, companyId: undefined }))
                }}
                onBlur={() => validateForm()}
                aria-invalid={!!formErrors.companyId}
                aria-describedby={formErrors.companyId ? 'audit-export-company-id-error' : undefined}
              />
              {formErrors.companyId && (
                <p id="audit-export-company-id-error" className="text-sm text-destructive" role="alert">
                  {formErrors.companyId}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-export-time-from">From</Label>
              <Input
                id="audit-export-time-from"
                type="date"
                value={timeFrom}
                onChange={(e) => {
                  setTimeFrom(e.target.value)
                  if (formErrors.timeFrom) setFormErrors((prev) => ({ ...prev, timeFrom: undefined, timeTo: undefined }))
                }}
                onBlur={() => validateForm()}
                aria-invalid={!!formErrors.timeFrom}
                aria-describedby={formErrors.timeFrom ? 'audit-export-time-from-error' : undefined}
              />
              {formErrors.timeFrom && (
                <p id="audit-export-time-from-error" className="text-sm text-destructive" role="alert">
                  {formErrors.timeFrom}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-export-time-to">To</Label>
              <Input
                id="audit-export-time-to"
                type="date"
                value={timeTo}
                onChange={(e) => {
                  setTimeTo(e.target.value)
                  if (formErrors.timeTo) setFormErrors((prev) => ({ ...prev, timeFrom: undefined, timeTo: undefined }))
                }}
                onBlur={() => validateForm()}
                aria-invalid={!!formErrors.timeTo}
                aria-describedby={formErrors.timeTo ? 'audit-export-time-to-error' : undefined}
              />
              {formErrors.timeTo && (
                <p id="audit-export-time-to-error" className="text-sm text-destructive" role="alert">
                  {formErrors.timeTo}
                </p>
              )}
            </div>
          </div>
          <AuditArtifactExporterButton
            viewContext={viewContext}
            variant="default"
            size="sm"
            onSuccess={handleExportSuccess}
          />
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Optional: narrow by company and time window before loading events for event-based signing.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="audit-filter-company-id">Company ID</Label>
            <Input
              id="audit-filter-company-id"
              placeholder="e.g. AAPL"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              aria-label="Company ID for event filters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-filter-time-from">From</Label>
            <Input
              id="audit-filter-time-from"
              type="date"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              aria-label="Filter events from date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-filter-time-to">To</Label>
            <Input
              id="audit-filter-time-to"
              type="date"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              aria-label="Filter events to date"
            />
          </div>
        </CardContent>
      </Card>

      <AuditArtifactSignerPanel
        events={events}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onSignAndDownload={handleSignAndDownload}
        isSigning={signEvents.isPending}
      />

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Signed artifacts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generated artifacts include raw payload refs, calculation inputs, weights, and integrity hashes.
            Signed with KMS for audit compliance.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(recentExports ?? []).length > 0 ? (
            <div className="space-y-3">
              {(recentExports ?? []).map((exp, idx) => {
                const meta = exp.artifactMeta ?? {
                  id: exp.artifactId,
                  companyId: viewContext.companyId,
                  timeWindow: {
                    start: viewContext.windowStart,
                    end: viewContext.windowEnd,
                  },
                  format: 'json' as const,
                  generatedAt: new Date().toISOString(),
                  sha256: exp.signatureHash ?? '',
                }
                return (
                  <PDFPreviewOrDownloadRow
                    key={exp.artifactId ?? `export-${idx}`}
                    artifactMeta={meta}
                    artifactJson={exp.artifactJson}
                    artifactPdfBase64={exp.artifactPdfBase64}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<FileDown className="h-6 w-6 text-muted-foreground" aria-hidden />}
              title="No recent exports"
              description="Use &quot;IPI Artifact Export&quot; above to generate signed JSON and PDF artifacts, or select NarrativeEvents and click &quot;Sign & download&quot; to create signed artifacts."
              action={
                <p className="text-xs text-muted-foreground">
                  Generated artifacts include raw payload refs, calculation inputs, weights, and integrity hashes.
                </p>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
