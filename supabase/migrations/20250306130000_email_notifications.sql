-- Email Notifications & System Alerts
-- Tables: email_messages, email_templates, email_delivery_stats, email_bounces,
--         user_email_preferences, audit_payloads

-- Email templates (verification, password reset, export ready, ingestion failure, system notification)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  provider_template_id TEXT
);

-- Email messages (queue + delivery tracking)
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "to" TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES public.email_templates(id),
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','bounced','failed')),
  provider_message_id TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_messages_status_idx ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS email_messages_user_id_idx ON public.email_messages(user_id);
CREATE INDEX IF NOT EXISTS email_messages_template_id_idx ON public.email_messages(template_id);
CREATE INDEX IF NOT EXISTS email_messages_created_at_idx ON public.email_messages(created_at);
CREATE INDEX IF NOT EXISTS email_messages_next_retry_idx ON public.email_messages(next_retry_at) WHERE status = 'queued';

-- Email delivery stats (aggregated metrics per template/window)
CREATE TABLE IF NOT EXISTS public.email_delivery_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL REFERENCES public.email_templates(id),
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
  bounce_code TEXT
);

CREATE INDEX IF NOT EXISTS email_bounces_email_idx ON public.email_bounces(email);

-- User email preferences (opt-in/opt-out)
CREATE TABLE IF NOT EXISTS public.user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  opt_in_emails JSONB DEFAULT '{}',
  unsubscribe_token TEXT UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Audit payloads (raw payload for every email attempt)
CREATE TABLE IF NOT EXISTS public.audit_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_payloads_email_message_idx ON public.audit_payloads(email_message_id);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_payloads ENABLE ROW LEVEL SECURITY;

-- Templates: admins can manage; users can read active
CREATE POLICY "Admins can manage email_templates"
  ON public.email_templates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read active templates"
  ON public.email_templates FOR SELECT
  USING (active = true);

-- Messages: service role / edge functions use service key; users see own
CREATE POLICY "Users can view own email_messages"
  ON public.email_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Delivery stats: admins only
CREATE POLICY "Admins can manage email_delivery_stats"
  ON public.email_delivery_stats FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bounces: admins only
CREATE POLICY "Admins can manage email_bounces"
  ON public.email_bounces FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User preferences: own record only
CREATE POLICY "Users can manage own email_preferences"
  ON public.user_email_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Audit: admins only
CREATE POLICY "Admins can view audit_payloads"
  ON public.audit_payloads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service can insert audit_payloads"
  ON public.audit_payloads FOR INSERT
  WITH CHECK (true);

-- Seed default templates
INSERT INTO public.email_templates (id, name, subject, body_html, body_text, version, active) VALUES
  ('verification', 'Email Verification', 'Verify your email - Gbox360', '<p>Hi {{name}},</p><p>Click the link below to verify your email:</p><p><a href="{{verification_url}}">Verify Email</a></p>', 'Hi {{name}}, click {{verification_url}} to verify your email.', 1, true),
  ('passwordReset', 'Reset your password - Gbox360', 'Reset your password', '<p>Hi {{name}},</p><p>Click the link below to reset your password:</p><p><a href="{{reset_url}}">Reset Password</a></p>', 'Hi {{name}}, click {{reset_url}} to reset your password.', 1, true),
  ('exportReady', 'Your export is ready', 'Export complete - Gbox360', '<p>Hi {{name}},</p><p>Your export is ready for download.</p>', 'Hi {{name}}, your export is ready.', 1, true),
  ('ingestionFailure', 'Ingestion alert', 'Ingestion failure - Gbox360', '<p>Ingestion failed for {{source}}.</p>', 'Ingestion failed for {{source}}.', 1, true),
  ('systemNotification', 'System notification', 'System notification - Gbox360', '<p>{{message}}</p>', '{{message}}', 1, true)
ON CONFLICT (id) DO NOTHING;
