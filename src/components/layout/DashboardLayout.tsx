import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  User,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Menu,
} from 'lucide-react'

const STORAGE_KEY = 'dashboard-sidebar-collapsed'

const dashboardNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About & Help', icon: HelpCircle },
]

export function DashboardLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      /* ignore */
    }
  }, [collapsed])

  const toggleCollapsed = () => setCollapsed((c) => !c)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="dashboard" />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-300 ease-in-out',
            collapsed ? 'w-16' : 'w-52'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-end border-b border-border transition-all duration-200',
              collapsed ? 'p-2' : 'p-4'
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-x-hidden">
            {dashboardNav.map((item) => {
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                    'hover:bg-muted hover:text-foreground',
                    isActive
                      ? 'bg-muted text-foreground border-l-2 border-accent -ml-[2px] pl-[14px]'
                      : 'text-muted-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile menu button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle dashboard menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-foreground/20 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* Mobile drawer */}
        <aside
          className={cn(
            'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-lg',
            'transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-2 space-y-1">
            {dashboardNav.map((item) => {
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                    'hover:bg-muted hover:text-foreground',
                    isActive ? 'bg-muted text-foreground border-l-2 border-accent' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main
            className={cn(
              'flex-1 transition-all duration-300',
              'pt-6 pb-24 lg:pb-6',
              'px-4 lg:px-6',
              'container max-w-7xl'
            )}
          >
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
