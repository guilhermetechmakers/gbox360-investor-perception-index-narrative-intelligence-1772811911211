import { Outlet, Link, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Database,
  FileJson,
  ArrowLeft,
} from 'lucide-react'

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/ingest', label: 'Ingest Monitor', icon: Database },
  { to: '/admin/payloads', label: 'Raw Payloads', icon: FileJson },
]

export function AdminLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="admin" />
      <div className="container flex gap-6 px-4 py-6">
        <aside className="w-52 shrink-0 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <nav className="pt-4 space-y-1">
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  location.pathname === item.to
                    ? 'bg-muted text-foreground border-l-2 border-accent'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
