import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useResendVerification } from '@/hooks/useAuth'
import { Loader2, Mail } from 'lucide-react'

const COOLDOWN_SECONDS = 60

export interface ResendVerificationButtonProps {
  email: string
  nextAllowedAt?: string | null
  onSuccess?: (nextAllowedAt?: string) => void
  className?: string
}

export function ResendVerificationButton({
  email,
  nextAllowedAt: initialNextAllowedAt,
  onSuccess,
  className,
}: ResendVerificationButtonProps) {
  const resend = useResendVerification()
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [nextAllowedAt, setNextAllowedAt] = useState<string | null>(
    initialNextAllowedAt ?? null
  )

  const computeCooldown = useCallback(() => {
    if (!nextAllowedAt) return 0
    const next = new Date(nextAllowedAt).getTime()
    const now = Date.now()
    const diff = Math.ceil((next - now) / 1000)
    return Math.max(0, diff)
  }, [nextAllowedAt])

  useEffect(() => {
    const initial = initialNextAllowedAt ? computeCooldown() : 0
    setCooldownRemaining(initial)
  }, [initialNextAllowedAt, computeCooldown])

  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          setNextAllowedAt(null)
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownRemaining])

  const handleResend = () => {
    if (!email?.trim() || cooldownRemaining > 0 || resend.isPending) return
    resend.mutate(email.trim(), {
      onSuccess: (data) => {
        if (data.nextAllowedAt) {
          setNextAllowedAt(data.nextAllowedAt)
          setCooldownRemaining(COOLDOWN_SECONDS)
        }
        onSuccess?.(data.nextAllowedAt)
      },
    })
  }

  const isDisabled =
    !email?.trim() || cooldownRemaining > 0 || resend.isPending

  return (
    <Button
      type="button"
      onClick={handleResend}
      disabled={isDisabled}
      className={className}
      aria-label={
        cooldownRemaining > 0
          ? `Resend verification email in ${cooldownRemaining} seconds`
          : 'Resend verification email'
      }
    >
      {resend.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending...
        </>
      ) : cooldownRemaining > 0 ? (
        `Resend in ${cooldownRemaining}s`
      ) : (
        <>
          <Mail className="h-4 w-4" aria-hidden />
          Resend verification email
        </>
      )}
    </Button>
  )
}
