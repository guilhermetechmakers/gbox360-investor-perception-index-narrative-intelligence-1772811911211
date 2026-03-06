import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileDown, Activity, LayoutDashboard } from 'lucide-react'

interface SectionLink {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface AdminDashboardLinkCardProps {
  sections?: SectionLink[]
  metrics?: {
    userCount?: number
    exportCount?: number
    healthScore?: number
  }
}

const DEFAULT_SECTIONS: SectionLink[] = [
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/audit-exports', label: 'Audit Exports', icon: FileDown },
  { to: '/admin', label: 'System Health', icon: Activity },
  { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
]

export function AdminDashboardLinkCard({
  sections = DEFAULT_SECTIONS,
  metrics = {},
}: AdminDashboardLinkCardProps) {
  const items = Array.isArray(sections) ? sections : DEFAULT_SECTIONS
  const { userCount, exportCount, healthScore } = metrics ?? {}

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((s) => {
          const Icon = s.icon
          return (
            <Button
              key={s.to + s.label}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to={s.to}>
                <Icon className="h-4 w-4" />
                {s.label}
              </Link>
            </Button>
          )
        })}
        {(userCount != null || exportCount != null || healthScore != null) && (
          <div className="pt-3 mt-3 border-t border-border text-xs text-muted-foreground space-y-1">
            {userCount != null && <p>Users: {userCount}</p>}
            {exportCount != null && <p>Exports: {exportCount}</p>}
            {healthScore != null && <p>Health: {healthScore}%</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
