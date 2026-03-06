import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LoginFormComponent,
  LayoutWrapper,
  SignUpLink,
} from '@/components/login'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        <div className="flex justify-center mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
            aria-label="Home"
          >
            <Building2 className="h-8 w-8 text-primary" />
            Gbox360
          </Link>
        </div>

        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-[1.75rem] font-bold">
              Sign in to Gbox360
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFormComponent
              onSubmit={handleSubmit}
              loading={signIn.isPending}
              demoLoading={demoSignIn.isPending}
              error={apiError}
              onDemo={features.demoMode ? handleDemo : undefined}
              showOAuth={features.oauthGoogle}
              showDemoPanel={features.demoMode}
            />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <SignUpLink />
        </p>

        {features.demoMode && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={handleDemo}
              disabled={demoSignIn.isPending}
              className={cn(
                'text-primary font-medium hover:underline',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Request demo - explore with limited access"
            >
              Request demo
            </button>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </LayoutWrapper>
  )
}
