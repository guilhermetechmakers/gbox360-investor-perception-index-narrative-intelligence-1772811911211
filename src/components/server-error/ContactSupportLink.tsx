import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ContactSupportLinkProps {
  /** Optional className */
  className?: string
  /** If true, render as a link to /about; otherwise as a styled link for use with onClick */
  asLink?: boolean
  /** Optional onClick when used as button (e.g. to open modal) */
  onClick?: () => void
}

/**
 * Secondary CTA for contacting support.
 * Can render as link to /about or as button for modal trigger.
 */
export function ContactSupportLink({
  className,
  asLink = true,
  onClick,
}: ContactSupportLinkProps) {
  if (asLink) {
    return (
      <Link
        to="/about"
        className={cn(
          'inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
          className
        )}
        aria-label="Contact support"
      >
        Contact Support
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
        className
      )}
      aria-label="Contact support"
    >
      Contact Support
    </button>
  )
}
