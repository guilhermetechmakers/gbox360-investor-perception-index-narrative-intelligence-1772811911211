import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUsers'
import { useChangePassword } from '@/hooks/useSettings'
import { PasswordResetLink } from '@/components/login/PasswordResetLink'
import { PasswordStrengthBar } from '@/components/signup/PasswordStrengthBar'
import { Skeleton } from '@/components/ui/skeleton'
import { KeyRound, Lock } from 'lucide-react'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization: z.string().optional(),
  role: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'admin', label: 'Admin' },
  { value: 'operator', label: 'Operator' },
  { value: 'auditor', label: 'Auditor' },
]

function mapUserToProfile(user: { id: string; email: string; full_name?: string; org?: string; role?: string } | null) {
  if (!user) return null
  return {
    id: user.id,
    name: user.full_name ?? '',
    email: user.email ?? '',
    organization: user.org,
    role: user.role,
  }
}

export function ProfileEditor() {
  const { data: user, isLoading } = useCurrentUser()
  const updateProfile = useUpdateUser()
  const changePassword = useChangePassword()
  const profile = mapUserToProfile(user ?? null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      organization: '',
      role: '',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? '',
        organization: profile.organization ?? '',
        role: profile.role ?? '',
      })
    }
  }, [profile, form])

  const onSubmit = (values: ProfileFormValues) => {
    if (!profile?.id) return
    updateProfile.mutate(
      {
        id: profile.id,
        full_name: values.name,
        org: values.organization || undefined,
        role: values.role as 'user' | 'admin' | 'operator' | 'auditor' | undefined,
      },
      {
        onSuccess: () => form.reset(values),
      }
    )
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: (ok) => {
          if (ok) {
            setShowPasswordForm(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
          }
        },
      }
    )
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <Card className="card-surface">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal details. Email is read-only; use Change Email below if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Your full name"
                className="transition-colors duration-150"
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email ?? ''}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                aria-describedby="email-readonly"
              />
              <p id="email-readonly" className="text-xs text-muted-foreground">
                Email is read-only. Use Change Email below or contact support.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                {...form.register('organization')}
                placeholder="Your organization"
                className="transition-colors duration-150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.watch('role') ?? ''}
                onValueChange={(v) => form.setValue('role', v)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(ROLE_OPTIONS ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change password
          </CardTitle>
          <CardDescription>
            Update your password. You will need your current password to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <PasswordStrengthBar password={newPassword} showRules />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    Passwords do not match
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    changePassword.isPending ||
                    !currentPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                  }
                >
                  {changePassword.isPending ? 'Updating…' : 'Update password'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            <PasswordResetLink />
          </p>
        </CardContent>
      </Card>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Two-factor authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security when signing in. (Coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">2FA</p>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication (placeholder)
              </p>
            </div>
            <Switch disabled aria-label="Enable 2FA (coming soon)" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
