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
import { Textarea } from '@/components/ui/textarea'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional request ID to pre-fill support context */
  requestId?: string
  /** Callback when modal closes; use to return focus to trigger */
  onClose?: () => void
}

/**
 * Accessible support request modal with focus trap.
 * Returns focus to the initiating control when closed.
 */
export function SupportModal({
  open,
  onOpenChange,
  requestId = 'UNKNOWN',
  onClose,
}: SupportModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next)
      if (!next) {
        setEmail('')
        setMessage('')
        onClose?.()
      }
    },
    [onOpenChange, onClose]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      // In a real app, this would call an API. For now, open mailto with pre-filled content.
      const subject = encodeURIComponent(`Server Error Support Request - ${requestId}`)
      const body = encodeURIComponent(
        `Request ID: ${requestId}\n\nMessage:\n${message || '(No message provided)'}`
      )
      const mailto = `mailto:support@gbox360.com?subject=${subject}&body=${body}`
      window.location.href = mailto
      setIsSubmitting(false)
      handleOpenChange(false)
      toast.success('Opening email client to contact support')
    },
    [requestId, message, handleOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="support-modal-description"
        onCloseAutoFocus={() => {
          onClose?.()
        }}
      >
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription id="support-modal-description">
            Describe your issue and we&apos;ll get back to you. Your Request ID ({requestId}) will
            help us investigate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-email">Your email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              placeholder="Describe what happened..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
