import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSignUp } from '@/hooks/useAuth'
import { Building2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  org: z.string().optional(),
  role: z.string().optional(),
  invite_code: z.string().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

type FormData = z.infer<typeof schema>

export function Signup() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    signUp.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        org: data.org,
        role: data.role,
        invite_code: data.invite_code,
      },
      { onSuccess: () => navigate('/verify-email') }
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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Jane Doe" className="mt-1" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="mt-1"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  className="mt-1"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="org">Organization (optional)</Label>
                <Input id="org" placeholder="Acme Inc" className="mt-1" {...register('org')} />
              </div>
              <div>
                <Label htmlFor="role">Role (optional)</Label>
                <Input id="role" placeholder="Analyst, PM, IR..." className="mt-1" {...register('role')} />
              </div>
              <div>
                <Label htmlFor="invite_code">Invite code (optional)</Label>
                <Input id="invite_code" className="mt-1" {...register('invite_code')} />
              </div>
              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" {...register('terms')} className="mt-1 rounded border-input" />
                  <span>I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-destructive mt-1">{errors.terms.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={signUp.isPending}>
                {signUp.isPending ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
