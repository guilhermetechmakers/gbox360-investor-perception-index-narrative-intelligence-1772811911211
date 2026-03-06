/**
 * Feature flags for optional functionality.
 * Toggle OAuth providers and invite code policies here.
 */
export const features = {
  /** Show Google OAuth sign-up button when provider is configured */
  oauthGoogle: import.meta.env.VITE_OAUTH_GOOGLE_ENABLED === 'true',
  /** Require invite code for signup (enterprise-only mode) */
  inviteCodeRequired: false,
  /** Enable demo mode (single-click exploration without full auth) */
  demoMode: import.meta.env.VITE_DEMO_MODE_ENABLED !== 'false',
} as const
