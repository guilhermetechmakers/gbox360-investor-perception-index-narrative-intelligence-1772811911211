/** Email notification types */

export type EmailMessageStatus = 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'

export interface EmailMessage {
  id: string
  user_id?: string
  to: string
  template_id: string
  payload: Record<string, unknown>
  status: EmailMessageStatus
  provider_message_id?: string
  retry_count: number
  last_attempt_at?: string
  next_retry_at?: string
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body_html?: string
  bodyHtml?: string
  body_text?: string
  bodyText?: string
  version: number
  last_updated_at?: string
  lastUpdatedAt?: string
  active: boolean
  provider_template_id?: string
  providerTemplateId?: string
}

export interface EmailDeliveryStats {
  id: string
  template_id: string
  delivered: number
  opened: number
  bounced: number
  failed: number
  suppressed: number
  provider?: string
  window_start: string
  window_end: string
}

export interface EmailBounce {
  id: string
  user_id?: string
  email: string
  reason?: string
  timestamp: string
  bounce_code?: string
}

export interface UserEmailPreference {
  user_id: string
  opt_in_emails: Record<string, boolean>
  unsubscribe_token?: string
  updated_at: string
}

export interface AuditPayload {
  id: string
  email_message_id: string
  raw_payload: Record<string, unknown>
  received_at: string
}

export interface EmailMetrics {
  delivered: number
  sent: number
  bounced: number
  failed: number
  queued: number
  openRate: number
}

export interface EmailMetricsResponse {
  metrics?: EmailMetrics
  deliveries?: number
  opens?: number
  bounces?: number
  failures?: number
  retries?: number
  timeSeries?: Array<{
    date: string
    delivered: number
    opened: number
    bounced: number
    failed: number
  }>
}

export interface EmailLogEntry {
  id: string
  to: string
  template_id: string
  templateId?: string
  status: string
  created_at: string
  user_id?: string
  rawPayload?: unknown
  receivedAt?: string
}

export interface EmailQueueItem {
  id: string
  to: string
  templateId: string
  status: EmailMessageStatus
  retryCount: number
  nextRetryAt?: string
  createdAt: string
}

export interface EmailLogItem {
  id: string
  emailMessageId?: string
  to: string
  templateId?: string
  template_id?: string
  status: string
  rawPayload?: unknown
  receivedAt?: string
  created_at?: string
}
