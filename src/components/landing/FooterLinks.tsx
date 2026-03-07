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
    <footer className="bg-primary text-white" role="contentinfo">
      <div className="container px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg" aria-label="Gbox360 home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-5 w-5 text-white" aria-hidden />
              </div>
              Gbox360
            </Link>
            <p className="mt-4 text-sm text-white/50 max-w-md leading-relaxed">
              Explainable narrative intelligence for the Investor Perception Index. Audit-first,
              transparent, and board-credible.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                All systems operational
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About & Help
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">Contact us</h4>
            <form
              onSubmit={handleSubmit}
              className="space-y-3"
              aria-label="Contact form"
              noValidate
            >
              {submitted ? (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4">
                  <p className="text-sm text-success font-medium">
                    Thanks! We&apos;ll be in touch soon.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="footer-name" className="sr-only">Name</label>
                    <Input
                      id="footer-name"
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent',
                        errors.name && 'border-destructive'
                      )}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="footer-email" className="sr-only">Email</label>
                    <Input
                      id="footer-email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent',
                        errors.email && 'border-destructive'
                      )}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="footer-message" className="sr-only">Message</label>
                    <Textarea
                      id="footer-message"
                      placeholder="Message (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      className={cn(
                        'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent resize-none',
                        errors.message && 'border-destructive'
                      )}
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    Send message
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <p>&copy; {currentYear} Gbox360. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
