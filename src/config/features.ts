/**
 * Feature flags for optional functionality.
 * Toggle OAuth providers and invite code policies here.
 */
export const features = {
  /** Show Google OAuth sign-up button when provider is configured */
  oauthGoogle: import.meta.env.VITE_OAUTH_GOOGLE_ENABLED === 'true',
  /** Require invite code for signup (enterprise-only mode) */
  inviteCodeRequired: false,
} as const
