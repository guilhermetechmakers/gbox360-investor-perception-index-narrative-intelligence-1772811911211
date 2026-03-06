-- Email Notifications & System Alerts
-- Tables for transactional email delivery, templates, metrics, and audit

-- Email templates (verification, password reset, export ready, ingestion failure, system notification)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  last_updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  provider_template_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Email messages (queue and delivery tracking)
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "to" TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')),
  provider_message_id TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_messages_status_idx ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS email_messages_to_idx ON public.email_messages("to");
CREATE INDEX IF NOT EXISTS email_messages_created_at_idx ON public.email_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS email_messages_template_id_idx ON public.email_messages(template_id);

-- Email delivery stats (aggregated metrics per template/window)
CREATE TABLE IF NOT EXISTS public.email_delivery_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  delivered INTEGER DEFAULT 0 NOT NULL,
  opened INTEGER DEFAULT 0 NOT NULL,
  bounced INTEGER DEFAULT 0 NOT NULL,
  failed INTEGER DEFAULT 0 NOT NULL,
  suppressed INTEGER DEFAULT 0 NOT NULL,
  provider TEXT,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_delivery_stats_template_window_idx ON public.email_delivery_stats(template_id, window_start, window_end);

-- Email bounces
CREATE TABLE IF NOT EXISTS public.email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  reason TEXT,
  "timestamp" TIMESTAMPTZ DEFAULT now() NOT NULL,
  bounce_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_bounces_email_idx ON public.email_bounces(email);

-- User email preferences (opt-in/opt-out)
CREATE TABLE IF NOT EXISTS public.user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  opt_in_emails JSONB DEFAULT '{}',
  unsubscribe_token TEXT UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Audit payloads (raw payload storage for compliance)
CREATE TABLE IF NOT EXISTS public.email_audit_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_message_id UUID REFERENCES public.email_messages(id) ON DELETE CASCADE,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_audit_payloads_message_idx ON public.email_audit_payloads(email_message_id);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_audit_payloads ENABLE ROW LEVEL SECURITY;

-- RLS: Admin-only for templates, stats, bounces, audit
CREATE POLICY "Admin can manage email_templates"
  ON public.email_templates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can view email_messages"
  ON public.email_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can insert email_messages"
  ON public.email_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can view email_delivery_stats"
  ON public.email_delivery_stats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can view email_bounces"
  ON public.email_bounces FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view own email_preferences"
  ON public.user_email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email_preferences"
  ON public.user_email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email_preferences"
  ON public.user_email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view email_audit_payloads"
  ON public.email_audit_payloads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default templates
INSERT INTO public.email_templates (name, subject, body_html, body_text, version)
VALUES
  ('verification', 'Verify your email - Gbox360', '<p>Hi {{name}},</p><p>Click the link below to verify your email:</p><p><a href="{{verification_url}}">Verify Email</a></p>', 'Hi {{name}}, click {{verification_url}} to verify your email.', 1),
  ('passwordReset', 'Reset your password - Gbox360', '<p>Hi {{name}},</p><p>Click the link below to reset your password:</p><p><a href="{{reset_url}}">Reset Password</a></p>', 'Hi {{name}}, click {{reset_url}} to reset your password.', 1),
  ('exportReady', 'Your export is ready - Gbox360', '<p>Hi {{name}},</p><p>Your export has been completed and is ready for download.</p>', 'Hi {{name}}, your export is ready.', 1),
  ('ingestionFailure', 'Ingestion alert - Gbox360', '<p>Hi {{name}},</p><p>An ingestion failure occurred: {{error_message}}</p>', 'Ingestion failure: {{error_message}}', 1),
  ('systemNotification', 'System notification - Gbox360', '<p>Hi {{name}},</p><p>{{message}}</p>', '{{message}}', 1)
ON CONFLICT (name) DO NOTHING;
