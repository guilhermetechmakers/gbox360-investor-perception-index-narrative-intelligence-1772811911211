import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { syncAuthTokenFromSession } from '@/lib/auth-token-sync'
import { supabase } from '@/lib/supabase'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { RequireAdminRole } from '@/components/auth/RequireAdminRole'

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
import { NarrativeExplorer } from '@/pages/NarrativeExplorer'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'
import { About } from '@/pages/About'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'

import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { UserManagement } from '@/pages/admin/UserManagement'
import { IngestMonitor } from '@/pages/admin/IngestMonitor'
import { TranscriptIngestion } from '@/pages/admin/TranscriptIngestion'
import { RawPayloadBrowser } from '@/pages/admin/RawPayloadBrowser'
import { AuditExports } from '@/pages/admin/AuditExports'
import { NarrativeEventsAdmin } from '@/pages/admin/NarrativeEventsAdmin'

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
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  useEffect(() => {
    const client = supabase
    if (!client) {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
      setHasSession(!!token)
      return
    }
    const check = async () => {
      const { data } = await client.auth.getSession()
      const ok = !!data.session
      if (ok) syncAuthTokenFromSession()
      setHasSession(ok)
    }
    check()
    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      client.auth.getSession().then(({ data }) => {
        if (data.session) syncAuthTokenFromSession()
        setHasSession(!!data.session)
      })
    })
    return () => subscription.unsubscribe()
  }, [])
  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!hasSession) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
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
          <Route path="/about-help" element={<About />} />
          <Route path="/about-help" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tos" element={<Terms />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="narratives" element={<NarrativeExplorer />} />
            <Route path="company/:id" element={<CompanyView />} />
            <Route path="drilldown/:narrativeId" element={<Drilldown />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdminRole>
                  <AdminLayout />
                </RequireAdminRole>
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="ingest-monitor" element={<IngestMonitor />} />
            <Route path="transcript-ingestion" element={<TranscriptIngestion />} />
            <Route path="payloads" element={<RawPayloadBrowser />} />
            <Route path="audit-exports" element={<AuditExports />} />
            <Route path="narrative-events" element={<NarrativeEventsAdmin />} />
          </Route>

          <Route path="/company/:id" element={<Navigate to="/dashboard" replace />} />
          <Route path="/drilldown/:narrativeId" element={<Navigate to="/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
