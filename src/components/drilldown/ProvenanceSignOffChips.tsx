import { Badge } from '@/components/ui/badge'
import { FileText, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProvenanceSignOffChipsProps {
  source?: string
  modelVersion?: string
  ingestionTimestamp?: string
  className?: string
}

/** Sign-off chips for provenance (source, model version, ingestion timestamp) */
export function ProvenanceSignOffChips({
  source,
  modelVersion,
  ingestionTimestamp,
  className,
}: ProvenanceSignOffChipsProps) {
  const hasAny = source ?? modelVersion ?? ingestionTimestamp

  if (!hasAny) return null

  const formattedTime = ingestionTimestamp
    ? new Date(ingestionTimestamp).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : null

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Provenance sign-off"
    >
      {source && (
        <Badge
          variant="outline"
          className="text-xs gap-1 font-normal"
          title="Data source"
        >
          <FileText className="h-3 w-3" aria-hidden />
          {source}
        </Badge>
      )}
      {modelVersion && (
        <Badge
          variant="outline"
          className="text-xs gap-1 font-normal"
          title="Model version"
        >
          <Tag className="h-3 w-3" aria-hidden />
          {modelVersion}
        </Badge>
      )}
      {formattedTime && (
        <Badge
          variant="outline"
          className="text-xs gap-1 font-normal"
          title="Ingestion timestamp"
        >
          <Clock className="h-3 w-3" aria-hidden />
          {formattedTime}
        </Badge>
      )}
    </div>
  )
}
