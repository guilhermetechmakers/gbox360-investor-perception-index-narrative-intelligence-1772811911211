import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useResetPasswordRequest, useResetPassword } from '@/hooks/useAuth'
import { Building2, KeyRound } from 'lucide-react'

const requestSchema = z.object({
  email: z.string().email('Invalid email'),
})

const resetSchema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] })

type RequestForm = z.infer<typeof requestSchema>
type ResetForm = z.infer<typeof resetSchema>

function passwordStrength(pwd: string): number {
  let s = 0
  if (pwd.length >= 8) s += 25
  if (pwd.length >= 12) s += 15
  if (/[A-Z]/.test(pwd)) s += 20
  if (/[a-z]/.test(pwd)) s += 20
  if (/[0-9]/.test(pwd)) s += 10
  if (/[^A-Za-z0-9]/.test(pwd)) s += 10
  return Math.min(100, s)
}

export function PasswordReset() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [requested, setRequested] = useState(false)

  const request = useResetPasswordRequest()
  const reset = useResetPassword()

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  })

  const password = resetForm.watch('password')
  const strength = passwordStrength(password ?? '')

  const onRequest = (data: RequestForm) => {
    request.mutate(data.email, { onSuccess: () => setRequested(true) })
  }

  const onReset = (data: ResetForm) => {
    if (!token) return
    reset.mutate({ token, password: data.password }, { onSuccess: () => {} })
  }

  if (token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-8 w-8 text-primary" />
              Gbox360
            </Link>
          </div>
          <Card>
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Set new password</CardTitle>
              <CardDescription>
                Enter your new password. Token expires after a short time for security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    className="mt-1"
                    {...resetForm.register('password')}
                  />
                  <Progress value={strength} className="mt-2 h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Password strength</p>
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Confirm"
                    className="mt-1"
                    {...resetForm.register('confirm')}
                  />
                  {resetForm.formState.errors.confirm && (
                    <p className="text-sm text-destructive mt-1">
                      {resetForm.formState.errors.confirm.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={reset.isPending}>
                  {reset.isPending ? 'Updating...' : 'Update password'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Back to login</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-8 w-8 text-primary" />
            Gbox360
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter your email and we will send a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requested ? (
              <p className="text-center text-sm text-muted-foreground">
                If an account exists for that email, you will receive a reset link shortly.
                <Link to="/login" className="block mt-2 text-primary hover:underline">Back to login</Link>
              </p>
            ) : (
              <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="mt-1"
                    {...requestForm.register('email')}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={request.isPending}>
                  {request.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Back to login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
