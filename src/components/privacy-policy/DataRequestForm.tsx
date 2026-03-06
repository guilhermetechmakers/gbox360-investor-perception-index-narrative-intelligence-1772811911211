import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataRequestType } from '@/types/privacy-policy'

const REQUEST_TYPES: { value: DataRequestType; label: string }[] = [
  { value: 'access', label: 'Access my data' },
  { value: 'correction', label: 'Correct my data' },
  { value: 'deletion', label: 'Delete my data' },
  { value: 'portability', label: 'Data portability' },
  { value: 'withdraw_consent', label: 'Withdraw consent' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  requestType: z.enum([
    'access',
    'correction',
    'deletion',
    'portability',
    'withdraw_consent',
    'other',
  ]),
  description: z.string().min(10, 'Please describe your request (at least 10 characters)'),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  email: '',
  requestType: 'access',
  description: '',
}

export interface DataRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitSuccess?: () => void
}

/**
 * Accessible data request form for privacy-related requests.
 * Opens in a dialog. Submits to a placeholder handler (no API yet).
 */
export function DataRequestForm({
  open,
  onOpenChange,
  onSubmitSuccess,
}: DataRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const requestType = watch('requestType')

  const onSubmit = async (_data: FormValues) => {
    setIsSubmitting(true)
    try {
      // Placeholder: no API yet. In production, call POST /policy/privacy/data-request
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Placeholder: in production, POST to /policy/privacy/data-request
      // Payload: { name, email, requestType, description }

      toast.success(
        'Your data request has been submitted. We will respond within 30 days.'
      )
      reset(defaultValues)
      onOpenChange(false)
      onSubmitSuccess?.()
    } catch {
      toast.error('Failed to submit. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-labelledby="data-request-dialog-title"
        aria-describedby="data-request-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="data-request-dialog-title">
            Submit a Data Request
          </DialogTitle>
          <DialogDescription id="data-request-dialog-description">
            Request access, correction, deletion, or portability of your personal data.
            We will respond within 30 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data-request-name">Name *</Label>
              <Input
                id="data-request-name"
                {...register('name')}
                placeholder="Your name"
                className={errors.name ? 'border-destructive' : ''}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'data-request-name-error' : undefined}
              />
              {errors.name && (
                <p id="data-request-name-error" className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-request-email">Email *</Label>
              <Input
                id="data-request-email"
                type="email"
                {...register('email')}
                placeholder="you@company.com"
                className={errors.email ? 'border-destructive' : ''}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'data-request-email-error' : undefined}
              />
              {errors.email && (
                <p id="data-request-email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-request-type">Request type *</Label>
            <Select
              value={requestType}
              onValueChange={(v) =>
                setValue('requestType', v as FormValues['requestType'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                id="data-request-type"
                className={errors.requestType ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-request-description">Description *</Label>
            <Textarea
              id="data-request-description"
              {...register('description')}
              placeholder="Describe your request in detail..."
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'data-request-description-error' : undefined
              }
            />
            {errors.description && (
              <p id="data-request-description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px] min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
