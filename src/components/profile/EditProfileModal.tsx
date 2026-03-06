import { useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateUser } from '@/hooks/useUsers'
import type { User } from '@/types/user'

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

export interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess?: () => void
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const updateProfile = useUpdateUser()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      organization: '',
      role: '',
    },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.full_name ?? '',
        organization: user.org ?? '',
        role: user.role ?? '',
      })
    }
  }, [open, user, form])

  const onSubmit = (values: ProfileFormValues) => {
    if (!user?.id) return
    updateProfile.mutate(
      {
        id: user.id,
        full_name: values.name,
        org: values.organization || undefined,
        role: (values.role as 'user' | 'admin' | 'operator' | 'auditor') || undefined,
      },
      {
        onSuccess: () => {
          form.reset(values)
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your personal details. Email cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-org">Organization</Label>
            <Input
              id="edit-org"
              {...form.register('organization')}
              placeholder="Your organization"
              className="transition-colors duration-150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={form.watch('role') ?? ''}
              onValueChange={(v) => form.setValue('role', v)}
            >
              <SelectTrigger id="edit-role">
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
