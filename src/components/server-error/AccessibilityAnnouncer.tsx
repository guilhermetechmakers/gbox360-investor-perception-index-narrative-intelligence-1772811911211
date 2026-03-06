import { useEffect, useRef } from 'react'

interface AccessibilityAnnouncerProps {
  /** Message to announce to screen readers */
  message: string
  /** Optional politeness level */
  politeness?: 'polite' | 'assertive'
}

/**
 * Live region that announces error state and action feedback to screen readers.
 * Visually hidden but exposed to assistive technologies.
 */
export function AccessibilityAnnouncer({
  message,
  politeness = 'assertive',
}: AccessibilityAnnouncerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && ref.current) {
      ref.current.textContent = message
    }
  }, [message])

  return (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  )
}
