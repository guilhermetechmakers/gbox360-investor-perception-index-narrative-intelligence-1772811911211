-- Canonical NarrativeEventAppend: immutable, append-only narrative events
-- Supports provenance, speaker heuristics, and replay/audit trails

CREATE TABLE IF NOT EXISTS public.narrative_event_append (
  event_id UUID PRIMARY KEY,
  raw_payload_id UUID NOT NULL,
  source TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'unknown',
  speaker_entity TEXT NOT NULL DEFAULT 'unknown',
  speaker_role TEXT NOT NULL DEFAULT 'unknown',
  audience_class TEXT NOT NULL DEFAULT 'unknown',
  raw_text TEXT NOT NULL DEFAULT '',
  ingestion_timestamp TIMESTAMPTZ NOT NULL,
  original_timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  authority_score NUMERIC(5,4) CHECK (authority_score IS NULL OR (authority_score >= 0 AND authority_score <= 1)),
  credibility_flags JSONB,
  provenance JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filtering and replay
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_ingestion_timestamp
  ON public.narrative_event_append(ingestion_timestamp);
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_original_timestamp
  ON public.narrative_event_append(original_timestamp);
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_source
  ON public.narrative_event_append(source);
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_platform
  ON public.narrative_event_append(platform);
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_audience_class
  ON public.narrative_event_append(audience_class);
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_provenance
  ON public.narrative_event_append((provenance->>'operator_id'), (provenance->>'ingest_system_id'));
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_metadata_company
  ON public.narrative_event_append((metadata->>'company_ticker'));
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_metadata_narrative
  ON public.narrative_event_append((metadata->>'narrative_tag'));

ALTER TABLE public.narrative_event_append ENABLE ROW LEVEL SECURITY;

-- Replay job status for read-index rebuilds
CREATE TABLE IF NOT EXISTS public.narrative_event_replay_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed')),
  progress NUMERIC(5,2) DEFAULT 0,
  message TEXT,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.narrative_event_replay_status ENABLE ROW LEVEL SECURITY;
