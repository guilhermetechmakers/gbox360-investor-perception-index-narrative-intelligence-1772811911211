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

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) return 'weak'
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 2) return 'weak'
  if (score <= 4) return 'moderate'
  return 'strong'
}

export function getPasswordStrengthScore(password: string): number {
  if (!password) return 0
  let s = 0
  if (password.length >= 8) s += 25
  if (password.length >= 12) s += 15
  if (/[A-Z]/.test(password)) s += 20
  if (/[a-z]/.test(password)) s += 20
  if (/[0-9]/.test(password)) s += 10
  if (/[^A-Za-z0-9]/.test(password)) s += 10
  return Math.min(100, s)
}

export function isPasswordStrongEnough(password: string): boolean {
  return getPasswordStrength(password) !== 'weak'
}

export function doPasswordsMatch(password: string, confirm: string): boolean {
  return password === confirm && password.length > 0
}
