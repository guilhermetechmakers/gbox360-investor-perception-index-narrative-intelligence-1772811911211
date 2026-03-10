import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ErrorLayoutContainer,
  HeroErrorCard,
  AccessibilityAnnouncer,
  TipsPanel,
} from '@/components/server-error'

/** Diagnostic payload shape passed via route state */
interface DiagnosticPayload {
  requestId?: string
  timestamp?: string
}

function sanitizePayload(payload: unknown): { requestId: string; timestamp: string } {
  const safe = (payload ?? {}) as DiagnosticPayload
  const requestId =
    typeof safe?.requestId === 'string' && safe.requestId.length > 0
      ? safe.requestId
      : `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const timestamp =
    typeof safe?.timestamp === 'string' && safe.timestamp.length > 0
      ? safe.timestamp
      : new Date().toISOString()
  return { requestId, timestamp }
}

export function ServerError() {
  const location = useLocation()
  const locationState = location?.state as unknown

  const [diagnostic, setDiagnostic] = useState(() => sanitizePayload(locationState))

  useEffect(() => {
    const payload = locationState as DiagnosticPayload | null | undefined
    if (!payload) return
    const rid = payload.requestId
    if (typeof rid === 'string' && rid.length > 0) {
      setDiagnostic(sanitizePayload(payload))
    }
  }, [locationState])

  const { requestId, timestamp } = diagnostic

  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    document.title = '500 Server Error | Gbox360'
    return () => {
      document.title = 'Gbox360'
    }
  }, [])

  return (
    <ErrorLayoutContainer>
      <AccessibilityAnnouncer
        message="500 Server Error. Something went wrong on our end. You can retry, contact support, or use the diagnostic information below."
        politeness="assertive"
      />
      <div className="w-full max-w-2xl mx-auto text-left animate-fade-in-up motion-reduce:animate-none space-y-8 text-foreground">
        <HeroErrorCard
          title="500 Server Error"
          subtitle="Something went wrong on our end. We're sorry for the inconvenience. Please try again, or contact support with the diagnostic information below."
          requestId={requestId}
          timestamp={timestamp}
          onRetry={handleRetry}
        />
        <section
          aria-labelledby="server-error-tips-heading"
          className="pt-6 border-t border-border"
        >
          <h2
            id="server-error-tips-heading"
            className="text-sm font-semibold text-foreground mb-3"
          >
            What you can do
          </h2>
          <TipsPanel />
        </section>
      </div>
    </ErrorLayoutContainer>
  )
}
