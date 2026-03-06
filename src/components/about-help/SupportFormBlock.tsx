import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { SectionCard } from './SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitSupportTicket } from '@/api/support'
import type { SupportTopic } from '@/types/about-help'
import { Paperclip, Loader2 } from 'lucide-react'

const supportTopicOptions: SupportTopic[] = [
  'General Support',
  'Demo Request',
  'Other',
]

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string(),
  topic: z.enum(['General Support', 'Demo Request', 'Other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'You must agree to data processing',
  }),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  email: '',
  company: '',
  topic: 'General Support',
  message: '',
  consent: false,
}

export function SupportFormBlock() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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

  const consent = watch('consent')
  const topic = watch('topic')

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: data.name ?? '',
        email: data.email ?? '',
        company: data.company ?? '',
        topic: (data.topic ?? 'General Support') as SupportTopic,
        message: data.message ?? '',
        consent: Boolean(data.consent),
      }
      const response = await submitSupportTicket(payload)
      const result = response ?? { success: false, error: 'Unknown error' }

      if (result.success) {
        toast.success(
          result.ticketId
            ? `Support request submitted. Reference: ${result.ticketId}`
            : 'Support request submitted successfully.'
        )
        reset(defaultValues)
      } else {
        toast.error(result.error ?? 'Failed to submit. Please try again.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SectionCard
      id="support"
      title="Contact Support"
      meta="Get help, request a demo, or report an issue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="support-name">Name *</Label>
            <Input
              id="support-name"
              {...register('name')}
              placeholder="Your name"
              className={errors.name ? 'border-destructive' : ''}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'support-name-error' : undefined}
            />
            {errors.name && (
              <p id="support-name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email *</Label>
            <Input
              id="support-email"
              type="email"
              {...register('email')}
              placeholder="you@company.com"
              className={errors.email ? 'border-destructive' : ''}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'support-email-error' : undefined}
            />
            {errors.email && (
              <p id="support-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-company">Company</Label>
          <Input
            id="support-company"
            {...register('company')}
            placeholder="Your company (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-topic">Topic *</Label>
          <Select
            value={topic}
            onValueChange={(v) => setValue('topic', v as SupportTopic, { shouldValidate: true })}
          >
            <SelectTrigger id="support-topic" className={errors.topic ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {supportTopicOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.topic && (
            <p className="text-sm text-destructive">{errors.topic.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-message">Message *</Label>
          <Textarea
            id="support-message"
            {...register('message')}
            placeholder="Describe your question or request..."
            rows={5}
            className={errors.message ? 'border-destructive' : ''}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'support-message-error' : undefined}
          />
          {errors.message && (
            <p id="support-message-error" className="text-sm text-destructive">
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="support-consent"
            checked={consent}
            onCheckedChange={(checked) =>
              setValue('consent', checked === true, { shouldValidate: true })
            }
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'support-consent-error' : undefined}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label
              htmlFor="support-consent"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I agree to the processing of my data for support purposes. *
            </Label>
            {errors.consent && (
              <p id="support-consent-error" className="text-sm text-destructive">
                {errors.consent.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
          <span>Attachments can be shared via follow-up email if needed.</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </SectionCard>
  )
}
