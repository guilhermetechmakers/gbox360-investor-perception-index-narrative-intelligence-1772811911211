import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { RequestIdPanel } from './RequestIdPanel'
import { TimestampDisplay } from './TimestampDisplay'
import { SupportModal } from './SupportModal'
import { cn } from '@/lib/utils'

interface HeroErrorCardProps {
  /** Main error heading */
  title: string
  /** Explanatory subtitle */
  subtitle: string
  /** Sanitized request ID */
  requestId: string
  /** ISO 8601 timestamp */
  timestamp: string
  /** Callback when Retry is clicked */
  onRetry: () => void
  /** Optional className */
  className?: string
}

/**
 * Main hero card presenting the 500 error state with actions and diagnostics.
 */
export function HeroErrorCard({
  title,
  subtitle,
  requestId,
  timestamp,
  onRetry,
  className,
}: HeroErrorCardProps) {
  const [supportOpen, setSupportOpen] = useState(false)
  const supportTriggerRef = useRef<HTMLButtonElement>(null)

  const handleSupportClose = useCallback(() => {
    supportTriggerRef.current?.focus()
  }, [])

  return (
    <>
      <Card
        className={cn(
          'w-full max-w-lg border border-border bg-card shadow-card transition-all duration-300',
          className
        )}
      >
        <CardHeader className="space-y-4 text-left">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
            aria-hidden
          >
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[3.25rem]">
            {title}
          </h1>
          <p className="text-base text-foreground leading-[1.6]">
            {subtitle}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary and secondary actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={onRetry}
              className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Retry loading the page"
            >
              Retry
            </Button>
            <Button
              ref={supportTriggerRef}
              variant="outline"
              onClick={() => setSupportOpen(true)}
              className="w-full sm:w-auto rounded-full border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Contact support"
            >
              Contact Support
            </Button>
          </div>

          {/* Diagnostic section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <RequestIdPanel requestId={requestId} />
            <TimestampDisplay timestamp={timestamp} />
          </div>
        </CardContent>
      </Card>

      <SupportModal
        open={supportOpen}
        onOpenChange={setSupportOpen}
        requestId={requestId}
        onClose={handleSupportClose}
      />
    </>
  )
}
