-- Topic Classification & Narrative Persistence
-- Add topic fields to narrative_event_append; create topic_aggregate table.

-- Add topic classification columns to narrative_event_append (nullable for backward compat)
ALTER TABLE public.narrative_event_append
  ADD COLUMN IF NOT EXISTS topic_labels JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS primary_topic TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS clustering_id TEXT,
  ADD COLUMN IF NOT EXISTS embedding_vector JSONB;

-- Index for topic queries
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_primary_topic
  ON public.narrative_event_append(primary_topic);

CREATE INDEX IF NOT EXISTS idx_narrative_event_append_topic_labels
  ON public.narrative_event_append USING GIN (topic_labels);

-- Topic aggregate table: per-topic persistence metrics
CREATE TABLE IF NOT EXISTS public.topic_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_label TEXT NOT NULL,
  company_ticker TEXT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  persistence_score NUMERIC(10, 6) NOT NULL DEFAULT 0,
  authority_weighted_count NUMERIC(12, 4) NOT NULL DEFAULT 0,
  top_contributing_events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_aggregate_topic_label
  ON public.topic_aggregate(topic_label);
CREATE INDEX IF NOT EXISTS idx_topic_aggregate_company_ticker
  ON public.topic_aggregate(company_ticker);
CREATE INDEX IF NOT EXISTS idx_topic_aggregate_period
  ON public.topic_aggregate(period_start, period_end);

ALTER TABLE public.topic_aggregate ENABLE ROW LEVEL SECURITY;
