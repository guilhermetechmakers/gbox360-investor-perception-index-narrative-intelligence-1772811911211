import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { VerifyEmail } from '@/pages/VerifyEmail'
import { PasswordReset } from '@/pages/PasswordReset'
import { NotFound } from '@/pages/NotFound'
import { ServerError } from '@/pages/ServerError'
import { Dashboard } from '@/pages/Dashboard'
import { CompanyView } from '@/pages/CompanyView'
import { Drilldown } from '@/pages/Drilldown'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'
import { About } from '@/pages/About'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'

import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { UserManagement } from '@/pages/admin/UserManagement'
import { IngestMonitor } from '@/pages/admin/IngestMonitor'
import { RawPayloadBrowser } from '@/pages/admin/RawPayloadBrowser'
import { AuditExports } from '@/pages/admin/AuditExports'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/forgot-password/reset" element={<PasswordReset />} />
          <Route path="/reset" element={<PasswordReset />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="company/:id" element={<CompanyView />} />
            <Route path="drilldown/:narrativeId" element={<Drilldown />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="ingest-monitor" element={<IngestMonitor />} />
            <Route path="payloads" element={<RawPayloadBrowser />} />
            <Route path="audit-exports" element={<AuditExports />} />
          </Route>

          <Route path="/company/:id" element={<Navigate to="/dashboard" replace />} />
          <Route path="/drilldown/:narrativeId" element={<Navigate to="/dashboard" replace />} />

          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
