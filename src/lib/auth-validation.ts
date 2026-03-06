/**
 * Auth validation utilities for password reset and signup flows.
 * RFC 5322-ish email validation; password strength and match checks.
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export function isEmailValid(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed)
}

export type PasswordStrength = 'weak' | 'moderate' | 'strong'

/** Password validation rules for signup (min 8 chars, upper, lower, number, symbol) */
export interface PasswordRules {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

export function getPasswordRules(password: string): PasswordRules {
  const p = password ?? ''
  return {
    minLength: p.length >= 8,
    hasUppercase: /[A-Z]/.test(p),
    hasLowercase: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSymbol: /[^A-Za-z0-9]/.test(p),
  }
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) return 'weak'
  const rules = getPasswordRules(password)
  const met = [
    rules.minLength,
    rules.hasUppercase,
    rules.hasLowercase,
    rules.hasNumber,
    rules.hasSymbol,
  ].filter(Boolean).length
  if (met <= 2) return 'weak'
  if (met <= 4) return 'moderate'
  return 'strong'
}

export function getPasswordStrengthScore(password: string): number {
  if (!password) return 0
  const rules = getPasswordRules(password)
  let s = 0
  if (rules.minLength) s += 25
  if (password.length >= 12) s += 15
  if (rules.hasUppercase) s += 20
  if (rules.hasLowercase) s += 20
  if (rules.hasNumber) s += 10
  if (rules.hasSymbol) s += 10
  return Math.min(100, s)
}

export function isPasswordStrongEnough(password: string): boolean {
  return getPasswordStrength(password) !== 'weak'
}

/** Full signup password validation: all rules must pass */
export function isSignupPasswordValid(password: string): boolean {
  const rules = getPasswordRules(password ?? '')
  return (
    rules.minLength &&
    rules.hasUppercase &&
    rules.hasLowercase &&
    rules.hasNumber &&
    rules.hasSymbol
  )
}

export function doPasswordsMatch(password: string, confirm: string): boolean {
  return password === confirm && password.length > 0
}

/** Invite code format: alphanumeric, 6-24 chars (optional validation) */
export function isInviteCodeFormatValid(code: string): boolean {
  if (!code || typeof code !== 'string') return true
  const trimmed = code.trim()
  if (trimmed.length === 0) return true
  return /^[A-Za-z0-9-_]{6,24}$/.test(trimmed)
}
