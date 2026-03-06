import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function FooterLinks() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})

  const validate = () => {
    const next: typeof errors = {}
    if (!name?.trim()) next.name = 'Name is required'
    if (!email?.trim()) next.email = 'Email is required'
    else if (!EMAIL_REGEX.test(email)) next.email = 'Invalid email format'
    if (message?.length > 0 && message.length < 10)
      next.message = 'Message must be at least 10 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card" role="contentinfo">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="Gbox360 home">
              <Building2 className="h-6 w-6 text-primary" aria-hidden />
              Gbox360
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md" style={{ lineHeight: 1.6 }}>
              Explainable narrative intelligence for the Investor Perception Index. Audit-first,
              transparent, and board-credible.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About & Help
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <form
              onSubmit={handleSubmit}
              className="mt-3 space-y-3"
              aria-label="Contact form"
              noValidate
            >
              {submitted ? (
                <p className="text-sm text-success font-medium">
                  Thanks! We&apos;ll be in touch soon.
                </p>
              ) : (
                <>
                  <div>
                    <label htmlFor="footer-name" className="sr-only">
                      Name
                    </label>
                    <Input
                      id="footer-name"
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(errors.name && 'border-destructive')}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'footer-name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="footer-name-error" className="mt-1 text-xs text-destructive">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="footer-email" className="sr-only">
                      Email
                    </label>
                    <Input
                      id="footer-email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(errors.email && 'border-destructive')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'footer-email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="footer-email-error" className="mt-1 text-xs text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="footer-message" className="sr-only">
                      Message
                    </label>
                    <Textarea
                      id="footer-message"
                      placeholder="Message (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      className={cn(errors.message && 'border-destructive')}
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>
                  <Button type="submit" size="sm" variant="outline">
                    Send
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} Gbox360. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
