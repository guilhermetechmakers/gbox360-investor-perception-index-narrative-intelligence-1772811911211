import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResendVerification, useChangeEmail } from '@/hooks/useAuth'
import { Building2, Mail } from 'lucide-react'

export function VerifyEmail() {
  const [changeEmailOpen, setChangeEmailOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const resend = useResendVerification()
  const changeEmail = useChangeEmail()

  const handleResend = () => {
    resend.mutate(undefined, { onSuccess: () => {} })
  }

  const handleChangeEmail = () => {
    if (!newEmail.trim()) return
    changeEmail.mutate(newEmail.trim(), {
      onSuccess: () => {
        setChangeEmailOpen(false)
        setNewEmail('')
      },
    })
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
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center">Verify your email</CardTitle>
            <CardDescription className="text-center">
              We sent a verification link to your email. Click the link to activate your account.
              You can resend the email or change your address below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleResend}
              disabled={resend.isPending}
            >
              {resend.isPending ? 'Sending...' : 'Resend verification email'}
            </Button>
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => setChangeEmailOpen(true)}
            >
              Change email address
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Having trouble?{' '}
              <a href="mailto:support@gbox360.com" className="text-primary hover:underline">
                Contact support
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              Enter your new email. We will send a verification link there.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@company.com"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeEmail} disabled={changeEmail.isPending || !newEmail.trim()}>
              {changeEmail.isPending ? 'Sending...' : 'Send verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
