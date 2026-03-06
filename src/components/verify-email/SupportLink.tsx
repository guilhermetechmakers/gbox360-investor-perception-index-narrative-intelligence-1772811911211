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

const SUPPORT_EMAIL = 'support@gbox360.com'
const SLA_MESSAGE =
  'We typically respond within 24 business hours. If you have not received the verification email within 15 minutes, check your spam folder first.'

export interface SupportLinkProps {
  variant?: 'link' | 'button'
  className?: string
}

export function SupportLink({ variant = 'link', className }: SupportLinkProps) {
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
          aria-label="Contact support for email verification help"
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
        className={`text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded ${className ?? ''}`}
        aria-label="Contact support for email verification help"
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
        aria-labelledby="support-title"
        aria-describedby="support-desc"
      >
        <DialogHeader>
          <DialogTitle id="support-title">Need help with verification?</DialogTitle>
          <DialogDescription id="support-desc">
            {SLA_MESSAGE}
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
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Email%20Verification%20Help`}>
              Open email client
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
