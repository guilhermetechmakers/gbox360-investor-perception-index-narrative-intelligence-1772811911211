import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { LogTable } from './LogTable'
import { Search } from 'lucide-react'
import type { AdminAction } from '@/types/admin'

interface AdminActionsPanelProps {
  actions?: AdminAction[]
  isLoading?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  resend_verification: 'Resend verification',
  disable: 'Disable account',
  export_audit: 'Audit export',
  replay_ingestion: 'Replay ingestion',
}

function formatActionType(type: string): string {
  return ACTION_LABELS[type] ?? type.replace(/_/g, ' ')
}

export function AdminActionsPanel({
  actions = [],
  isLoading = false,
}: AdminActionsPanelProps) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const items = Array.isArray(actions) ? actions : []

  const filtered = items.filter((a) => {
    const matchSearch =
      !search ||
      a.actionType?.toLowerCase().includes(search.toLowerCase()) ||
      a.userId?.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || a.actionType === actionFilter
    return matchSearch && matchAction
  })

  const actionTypes = [...new Set(items.map((a) => a.actionType).filter(Boolean))]

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent admin actions</CardTitle>
        <p className="text-sm text-muted-foreground">Resends, disables, exports, replays</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {actionTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {formatActionType(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No admin actions found.</p>
          </div>
        ) : (
          <LogTable<AdminAction>
            columns={[
              { key: 'actionType', header: 'Action', render: (a) => formatActionType(a.actionType ?? '') },
              { key: 'userId', header: 'User', render: (a) => a.userId ?? '—' },
              { key: 'timestamp', header: 'Time', render: (a) => (a.timestamp ? new Date(a.timestamp).toLocaleString() : '—') },
            ]}
            data={filtered}
            keyExtractor={(a) => a.id}
          />
        )}
      </CardContent>
    </Card>
  )
}
