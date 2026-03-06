import { cn } from '@/lib/utils'

export interface HelperTextBlockProps {
  variant?: 'token-expiry' | 'rate-limit' | 'security'
  className?: string
  children?: React.ReactNode
}

const CONTENT: Record<NonNullable<HelperTextBlockProps['variant']>, string> = {
  'token-expiry':
    'Reset links expire after 1 hour for security. If your link has expired, request a new one.',
  'rate-limit':
    'To prevent abuse, we limit how often you can request reset emails. If you need another link, wait a few minutes.',
  security:
    'Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.',
}

export function HelperTextBlock({
  variant = 'token-expiry',
  className,
  children,
}: HelperTextBlockProps) {
  return (
    <p
      className={cn(
        'text-xs text-muted-foreground leading-relaxed',
        className
      )}
    >
      {children ?? CONTENT[variant]}
    </p>
  )
}
