import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineNode, PipelineGraphData } from '@/types/ingest'

const STAGE_LABELS: Record<string, string> = {
  fetch: 'Fetch',
  normalize: 'Normalize',
  store: 'Store',
  index: 'Index',
}

const HEALTH_COLORS = {
  healthy: 'bg-success',
  degraded: 'bg-accent',
  unhealthy: 'bg-destructive',
}

interface StageDetailCardProps {
  node: PipelineNode
  onClose: () => void
}

function StageDetailCard({ node, onClose }: StageDetailCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{STAGE_LABELS[node.stage] ?? node.stage}</span>
        <Badge
          variant={
            node.health === 'unhealthy'
              ? 'destructive'
              : node.health === 'degraded'
                ? 'accent'
                : 'success'
          }
        >
          {node.health}
        </Badge>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        {node.backlogSize !== undefined && <p>Backlog: {node.backlogSize}</p>}
        {node.processedCount !== undefined && <p>Processed: {node.processedCount}</p>}
        {node.errorCount !== undefined && <p>Errors: {node.errorCount}</p>}
        {node.provenance && <p className="truncate" title={node.provenance}>Provenance: {node.provenance}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-xs text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Close
      </button>
    </div>
  )
}

interface PipelineGraphProps {
  graphData: PipelineGraphData
  isLoading?: boolean
}

const DEFAULT_GRAPH: PipelineGraphData = {
  nodes: [
    { id: 'fetch', stage: 'fetch', label: 'Fetch', health: 'healthy', backlogSize: 0, processedCount: 0, errorCount: 0 },
    { id: 'normalize', stage: 'normalize', label: 'Normalize', health: 'healthy', backlogSize: 0, processedCount: 0, errorCount: 0 },
    { id: 'store', stage: 'store', label: 'Store', health: 'healthy', backlogSize: 0, processedCount: 0, errorCount: 0 },
    { id: 'index', stage: 'index', label: 'Index', health: 'healthy', backlogSize: 0, processedCount: 0, errorCount: 0 },
  ],
  edges: [
    { from: 'fetch', to: 'normalize' },
    { from: 'normalize', to: 'store' },
    { from: 'store', to: 'index' },
  ],
}

export function PipelineGraph({
  graphData,
  isLoading = false,
}: PipelineGraphProps) {
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null)
  const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : DEFAULT_GRAPH.nodes

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          Pipeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fetch → Normalize → Store → Index
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2">
            {nodes.map((node, i) => {
              const isSelected = selectedNode?.id === node.id
              return (
                <div key={node.id} className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedNode(isSelected ? null : node)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border border-border px-4 py-2',
                          'transition-all duration-200 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected && 'ring-2 ring-accent border-accent'
                        )}
                        aria-label={`Stage ${node.label}, ${node.health}`}
                      >
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            HEALTH_COLORS[node.health] ?? HEALTH_COLORS.healthy
                          )}
                          aria-hidden
                        />
                        <span className="font-medium">{STAGE_LABELS[node.stage] ?? node.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-xs"
                    >
                      <p className="font-medium">{node.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Backlog: {node.backlogSize ?? 0} | Processed: {node.processedCount ?? 0} | Errors: {node.errorCount ?? 0}
                      </p>
                      {node.provenance && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={node.provenance}>
                          {node.provenance}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  {i < nodes.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                  )}
                </div>
              )
            })}
          </div>
          {selectedNode && (
            <div className="mt-4">
              <StageDetailCard node={selectedNode} onClose={() => setSelectedNode(null)} />
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
