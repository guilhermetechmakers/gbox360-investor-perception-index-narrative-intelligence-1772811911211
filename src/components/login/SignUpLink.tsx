import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface SignUpLinkProps {
  className?: string
}

export function SignUpLink({ className }: SignUpLinkProps) {
  return (
    <Link
      to="/signup"
      className={cn(
        'text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label="Sign up for a new account"
    >
      Sign up
    </Link>
  )
}
