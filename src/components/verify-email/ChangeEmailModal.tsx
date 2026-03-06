import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangeEmail } from '@/hooks/useAuth'

const schema = z.object({
  newEmail: z.string().min(1, 'Email required').email('Invalid email format'),
  currentPassword: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export interface ChangeEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
  requirePassword?: boolean
  onSuccess?: (newEmail: string) => void
}

export function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
  requirePassword = false,
  onSuccess,
}: ChangeEmailModalProps) {
  const changeEmail = useChangeEmail()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: '', currentPassword: '' },
  })

  const onSubmit = (data: FormData) => {
    changeEmail.mutate(
      {
        newEmail: data.newEmail.trim(),
        currentPassword: data.currentPassword?.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            reset({ newEmail: '', currentPassword: '' })
            onOpenChange(false)
            onSuccess?.(data.newEmail.trim())
          }
        },
      }
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset({ newEmail: '', currentPassword: '' })
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-labelledby="change-email-title"
        aria-describedby="change-email-desc"
      >
        <DialogHeader>
          <DialogTitle id="change-email-title">Change email address</DialogTitle>
          <DialogDescription id="change-email-desc">
            Enter your new email. We will send a verification link there.
            {requirePassword &&
              ' Re-enter your password to confirm this change.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="change-email-new">New email</Label>
            <Input
              id="change-email-new"
              type="email"
              placeholder="new@company.com"
              autoComplete="email"
              className="mt-1"
              {...register('newEmail')}
            />
            {errors.newEmail && (
              <p
                className="text-sm text-destructive mt-1"
                role="alert"
              >
                {errors.newEmail.message}
              </p>
            )}
          </div>
          {requirePassword && (
            <div>
              <Label htmlFor="change-email-password">Current password</Label>
              <Input
                id="change-email-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-1"
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p
                  className="text-sm text-destructive mt-1"
                  role="alert"
                >
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Current: {currentEmail || '—'}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changeEmail.isPending}>
              {changeEmail.isPending ? 'Updating...' : 'Update & send verification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
