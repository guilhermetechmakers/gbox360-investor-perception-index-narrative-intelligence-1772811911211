import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />
      <main className="container px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
