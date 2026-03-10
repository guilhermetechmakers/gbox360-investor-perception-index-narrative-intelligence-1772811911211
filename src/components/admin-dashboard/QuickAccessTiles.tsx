import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileJson, Database, FileDown, ChevronRight, Mail, LayoutGrid } from 'lucide-react'
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
    to: '/admin/email',
    label: 'Email Notifications',
    description: 'Delivery metrics, templates, queue, and audit logs',
    icon: Mail,
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

const ICON_SIZE = 'h-5 w-5'

export function QuickAccessTiles() {
  const tiles = TILES ?? []

  return (
    <Card
      className="rounded-[10px] border border-border bg-card text-card-foreground shadow-card transition-all duration-300"
      aria-labelledby="quick-access-title"
      aria-describedby="quick-access-desc"
    >
      <CardHeader>
        <CardTitle id="quick-access-title" className="text-lg font-semibold">
          Quick access
        </CardTitle>
        <CardDescription id="quick-access-desc">Operational tools</CardDescription>
      </CardHeader>
      <CardContent>
        {tiles.length === 0 ? (
          <div
            className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border border-dashed bg-muted/20 px-4 py-10 text-center shadow-sm"
            role="status"
            aria-label="No quick access tiles available"
          >
            <LayoutGrid className={cn(ICON_SIZE, 'text-muted-foreground mb-3')} aria-hidden />
            <p className="text-sm font-medium text-foreground">No tools available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick access tiles will appear here when configured.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tiles.map((tile) => {
              const Icon = tile.icon
              return (
                <Link
                  key={tile.to}
                  to={tile.to}
                  className={cn(
                    'group flex min-h-[44px] items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm',
                    'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-accent/50',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                  aria-label={`${tile.label}: ${tile.description}. Go to ${tile.label}.`}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <Icon className={ICON_SIZE} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground transition-colors group-hover:text-accent">
                      {tile.label}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{tile.description}</p>
                  </div>
                  <ChevronRight
                    className={cn('shrink-0 text-muted-foreground transition-colors group-hover:text-accent', ICON_SIZE)}
                    aria-hidden
                  />
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
