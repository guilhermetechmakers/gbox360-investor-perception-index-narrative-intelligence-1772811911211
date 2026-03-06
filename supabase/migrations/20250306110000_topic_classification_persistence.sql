-- Topic Classification & Narrative Persistence
-- Adds topic classification columns to narrative_event_append and creates topic_aggregates table.

-- Add topic classification columns to narrative_event_append (nullable for backward compat)
ALTER TABLE public.narrative_event_append
  ADD COLUMN IF NOT EXISTS topic_labels JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS primary_topic TEXT,
  ADD COLUMN IF NOT EXISTS clustering_id TEXT,
  ADD COLUMN IF NOT EXISTS classification_explanation TEXT;

-- Index for primary_topic filtering
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_primary_topic
  ON public.narrative_event_append(primary_topic) WHERE primary_topic IS NOT NULL;

-- Topic aggregates table (computed persistence metrics per topic/period)
CREATE TABLE IF NOT EXISTS public.topic_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_label TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  company_ticker TEXT,
  persistence_score NUMERIC(10,4) NOT NULL DEFAULT 0,
  authority_weighted_count NUMERIC(12,4) NOT NULL DEFAULT 0,
  top_contributing_events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_label, period_start, period_end, COALESCE(company_ticker, ''))
);

CREATE INDEX IF NOT EXISTS idx_topic_aggregates_period
  ON public.topic_aggregates(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_topic_aggregates_company
  ON public.topic_aggregates(company_ticker) WHERE company_ticker IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_topic_aggregates_topic
  ON public.topic_aggregates(topic_label);

ALTER TABLE public.topic_aggregates ENABLE ROW LEVEL SECURITY;
