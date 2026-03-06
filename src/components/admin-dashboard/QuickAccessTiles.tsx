import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileJson, Database, FileDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TileConfig {
  to: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const TILES: TileConfig[] = [
  {
    to: '/admin/users',
    label: 'User Management',
    description: 'Manage users, roles, and support actions',
    icon: Users,
  },
  {
    to: '/admin/payloads',
    label: 'Raw Payload Browser',
    description: 'Browse payloads, inspect provenance, replay',
    icon: FileJson,
  },
  {
    to: '/admin/ingest-monitor',
    label: 'Ingest Monitor',
    description: 'Queue metrics, errors, rate limits',
    icon: Database,
  },
  {
    to: '/admin/audit-exports',
    label: 'Audit Exports',
    description: 'Sign and download audit artifacts',
    icon: FileDown,
  },
]

export function QuickAccessTiles() {
  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick access</CardTitle>
        <p className="text-sm text-muted-foreground">Operational tools</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {TILES.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className={cn(
                  'group flex items-center gap-4 rounded-lg border border-border p-4',
                  'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
                  'hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-accent transition-colors">
                    {tile.label}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {tile.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
