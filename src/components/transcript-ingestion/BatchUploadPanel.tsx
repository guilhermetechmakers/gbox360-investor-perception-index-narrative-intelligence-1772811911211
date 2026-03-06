/**
 * Batch upload panel for transcript ingestion
 * Drag-and-drop or file picker for JSON/ZIP with manifest
 */
import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileJson, FileArchive, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCEPT = '.json,.zip,application/json,application/zip'
const MAX_SIZE_MB = 50

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface BatchUploadPanelProps {
  onFilesSelected: (files: File[]) => void
  onManifestSubmit?: (manifestUrl: string, batchId: string, company: string) => void
  isSubmitting?: boolean
  disabled?: boolean
}

export function BatchUploadPanel({
  onFilesSelected,
  onManifestSubmit,
  isSubmitting = false,
  disabled = false,
}: BatchUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [manifestUrl, setManifestUrl] = useState('')
  const [batchId, setBatchId] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validateFiles = useCallback((fileList: File[]): string | null => {
    const list = Array.isArray(fileList) ? fileList : []
    if (list.length === 0) return 'Select at least one file'
    const totalSize = list.reduce((s, f) => s + (f?.size ?? 0), 0)
    if (totalSize > MAX_SIZE_MB * 1024 * 1024) {
      return `Total size exceeds ${MAX_SIZE_MB} MB`
    }
    const invalid = list.find((f) => {
      const name = f?.name?.toLowerCase() ?? ''
      return !name.endsWith('.json') && !name.endsWith('.zip')
    })
    if (invalid) return 'Only JSON and ZIP files are allowed'
    return null
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setError(null)
      const items = Array.from(e.dataTransfer?.files ?? [])
      const err = validateFiles(items)
      if (err) {
        setError(err)
        return
      }
      setFiles(items)
      onFilesSelected(items)
    },
    [onFilesSelected, validateFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      const items = Array.from(e.target?.files ?? [])
      const err = validateFiles(items)
      if (err) {
        setError(err)
        return
      }
      setFiles(items)
      onFilesSelected(items)
    },
    [onFilesSelected, validateFiles]
  )

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index)
      setFiles(next)
      onFilesSelected(next)
      setError(null)
    },
    [files, onFilesSelected]
  )

  const handleManifestSubmit = useCallback(() => {
    if (!onManifestSubmit || !manifestUrl.trim() || !batchId.trim() || !company.trim()) {
      setError('Manifest URL, batch ID, and company are required')
      return
    }
    setError(null)
    onManifestSubmit(manifestUrl.trim(), batchId.trim(), company.trim())
  }, [onManifestSubmit, manifestUrl, batchId, company])

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          Batch upload
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload JSON or ZIP files with transcripts, or provide a manifest URL
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag-and-drop zone */}
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('transcript-file-input')?.click()}
          onKeyDown={(e) => e.key === 'Enter' && (document.getElementById('transcript-file-input') as HTMLInputElement)?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-muted-foreground/40 hover:bg-muted/50',
            disabled && 'opacity-60 cursor-not-allowed pointer-events-none'
          )}
          aria-label="Drop transcript files or click to select"
        >
          <input
            id="transcript-file-input"
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={handleFileInput}
            disabled={disabled}
          />
          <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JSON or ZIP · Max {MAX_SIZE_MB} MB total
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Selected files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected files</Label>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {(files ?? []).map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {f.name.endsWith('.zip') ? (
                      <FileArchive className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileJson className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{f.name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {formatBytes(f.size ?? 0)}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(i)
                    }}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Manifest URL form */}
        {onManifestSubmit && (
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-sm font-medium">Or use manifest URL</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Input
                  placeholder="https://bucket.s3.../manifests/batch-123.json"
                  value={manifestUrl}
                  onChange={(e) => setManifestUrl(e.target.value)}
                  disabled={disabled}
                  className="font-mono text-sm"
                />
              </div>
              <Input
                placeholder="Batch ID"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                disabled={disabled}
              />
              <Input
                placeholder="Company (ticker)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={disabled}
              />
              <Button
                onClick={handleManifestSubmit}
                disabled={disabled || isSubmitting || !manifestUrl.trim() || !batchId.trim() || !company.trim()}
              >
                {isSubmitting ? 'Submitting…' : 'Submit batch'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
