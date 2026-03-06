import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface PasswordResetLinkProps {
  className?: string
}

export function PasswordResetLink({ className }: PasswordResetLinkProps) {
  return (
    <Link
      to="/forgot-password"
      className={cn(
        'text-sm text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label="Forgot password? Reset it here"
    >
      Forgot password?
    </Link>
  )
}
