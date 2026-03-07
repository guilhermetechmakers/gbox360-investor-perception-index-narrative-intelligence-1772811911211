import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LoginFormComponent,
  LayoutWrapper,
  SignUpLink,
} from '@/components/login'
import { useSignIn, useDemoSignIn } from '@/hooks/useAuth'
import { features } from '@/config/features'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const signIn = useSignIn()
  const demoSignIn = useDemoSignIn()

  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
  const isAuthenticated = !!token

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const highlightDemo = searchParams.get('demo') === '1'
    if (highlightDemo) {
      const el = document.getElementById('demo-panel')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams])

  const handleSubmit = (data: { email: string; password: string; rememberMe?: boolean }) => {
    signIn.mutate(
      {
        email: data.email,
        password: data.password,
        remember: data.rememberMe,
      },
      { onSuccess: () => navigate('/dashboard') }
    )
  }

  const handleDemo = () => {
    demoSignIn.mutate(undefined, {
      onSuccess: () => navigate('/dashboard'),
    })
  }

  const apiError = signIn.error?.message ?? null

  return (
    <LayoutWrapper>
      <div className="w-full animate-fade-in-up">
        {/* Mobile logo (hidden on lg where branded panel shows) */}
        <div className="flex justify-center mb-8 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:text-primary transition-colors"
            aria-label="Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            Gbox360
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your dashboard and narrative insights.
          </p>
        </div>

        <LoginFormComponent
          onSubmit={handleSubmit}
          loading={signIn.isPending}
          demoLoading={demoSignIn.isPending}
          error={apiError}
          onDemo={features.demoMode ? handleDemo : undefined}
          showOAuth={features.oauthGoogle}
          showDemoPanel={features.demoMode}
        />

        <div className="mt-8 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <SignUpLink />
          </p>

          {features.demoMode && (
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={handleDemo}
                disabled={demoSignIn.isPending}
                className={cn(
                  'text-accent font-semibold hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Request demo - explore with limited access"
              >
                Request demo
              </button>
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground/70 pt-4">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline font-medium">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </LayoutWrapper>
  )
}
