export interface AuthResponse {
  token: string
  user: { id: string; email: string; full_name?: string; role?: string }
}

export interface SignInInput {
  email: string
  password: string
  remember?: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  org?: string
  role?: string
  invite_code?: string
}

/** Verification email status from backend */
export type VerificationStatusType = 'pending' | 'sent' | 'delivered' | 'bounced' | 'idle' | 'unknown'

export interface VerificationStatusResponse {
  status: VerificationStatusType
  lastSentAt?: string | null
  attempts?: number
  email?: string
}

export interface ResendVerificationResponse {
  success: boolean
  message: string
  nextAllowedAt?: string
}

export interface ChangeEmailResponse {
  success: boolean
  message: string
}

/** Password reset token status (optional endpoint for UX) */
export interface PasswordResetTokenStatusResponse {
  valid: boolean
  expiresAt?: string
  reason?: string
}

