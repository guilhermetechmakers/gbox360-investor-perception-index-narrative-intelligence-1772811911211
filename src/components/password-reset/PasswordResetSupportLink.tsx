import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPPORT_EMAIL = 'support@gbox360.com'
const PASSWORD_RESET_MESSAGE =
  'We typically respond within 24 business hours. If your reset link has expired or you did not receive the email, check your spam folder first. You can also request a new reset link from the password reset page.'

export interface PasswordResetSupportLinkProps {
  variant?: 'link' | 'button'
  className?: string
}

export function PasswordResetSupportLink({
  variant = 'link',
  className,
}: PasswordResetSupportLinkProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'button') {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={className}
          aria-label="Contact support for password reset help"
        >
          <HelpCircle className="h-4 w-4" aria-hidden />
          Contact support
        </Button>
        <SupportModal open={open} onOpenChange={setOpen} />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
          className
        )}
        aria-label="Contact support for password reset help"
      >
        Contact support
      </button>
      <SupportModal open={open} onOpenChange={setOpen} />
    </>
  )
}

function SupportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby="password-reset-support-title"
        aria-describedby="password-reset-support-desc"
      >
        <DialogHeader>
          <DialogTitle id="password-reset-support-title">
            Need help with password reset?
          </DialogTitle>
          <DialogDescription id="password-reset-support-desc">
            {PASSWORD_RESET_MESSAGE}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Email us at{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary font-medium hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            with your registered email address and a brief description of the
            issue.
          </p>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Password%20Reset%20Help`}
            >
              Open email client
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
