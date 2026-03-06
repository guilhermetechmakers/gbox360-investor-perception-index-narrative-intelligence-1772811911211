import { Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ContactInfo } from '@/types/privacy-policy'

export interface ContactPanelProps {
  contactInfo?: ContactInfo | null
  onRequestDataAccess?: () => void
  className?: string
}

/**
 * Contact information panel with primary CTA for data access requests.
 */
export function ContactPanel({
  contactInfo,
  onRequestDataAccess,
  className,
}: ContactPanelProps) {
  const email = contactInfo?.email ?? ''
  const phone = contactInfo?.phone ?? ''
  const address = contactInfo?.address ?? ''
  const hasContactInfo = Boolean(email || phone || address)

  return (
    <section
      aria-labelledby="contact-panel-heading"
      className={cn(
        'rounded-[10px] border border-border bg-card p-6 md:p-7',
        'shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <h2
        id="contact-panel-heading"
        className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.5rem] mb-6"
      >
        Contact & Data Requests
      </h2>

      {hasContactInfo && (
        <div className="space-y-4 mb-6">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -mx-2 -my-1"
            >
              <Mail className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1 -mx-2 -my-1"
            >
              <Phone className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              <span>{phone}</span>
            </a>
          )}
          {address && (
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 shrink-0 text-accent mt-0.5" aria-hidden />
              <span>{address}</span>
            </div>
          )}
        </div>
      )}

      {!hasContactInfo && (
        <p className="text-muted-foreground text-sm mb-6">
          Contact information is not available. Please check back later.
        </p>
      )}

      <Button
        type="button"
        onClick={onRequestDataAccess}
        className="min-h-[44px] min-w-[180px]"
        aria-label="Submit a data access request"
      >
        Submit a Data Request
      </Button>
    </section>
  )
}
