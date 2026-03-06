-- Resilient Ingestion Pipeline: RawPayload, NarrativeEvent, DLQ, ReplayQueue
-- Append-only raw payload storage; normalized NarrativeEvent with provenance; DLQ and Replay for failed items

-- RawPayload: append-only storage for raw ingested data
CREATE TABLE IF NOT EXISTS public.raw_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  ingested_at TIMESTAMPTZ DEFAULT now(),
  batch_id TEXT,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(external_id, source)
);

CREATE INDEX IF NOT EXISTS raw_payloads_source_idx ON public.raw_payloads(source);
CREATE INDEX IF NOT EXISTS raw_payloads_batch_id_idx ON public.raw_payloads(batch_id);
CREATE INDEX IF NOT EXISTS raw_payloads_ingested_at_idx ON public.raw_payloads(ingested_at);
CREATE INDEX IF NOT EXISTS raw_payloads_is_processed_idx ON public.raw_payloads(is_processed);

ALTER TABLE public.raw_payloads ENABLE ROW LEVEL SECURITY;

-- NarrativeEvent: normalized events with provenance
CREATE TABLE IF NOT EXISTS public.narrative_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  source TEXT NOT NULL,
  speaker_entity TEXT DEFAULT '',
  speaker_role TEXT DEFAULT '',
  audience_class TEXT DEFAULT '',
  text TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT now(),
  provenance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS narrative_events_external_id_idx ON public.narrative_events(external_id);
CREATE INDEX IF NOT EXISTS narrative_events_source_idx ON public.narrative_events(source);
CREATE INDEX IF NOT EXISTS narrative_events_timestamp_idx ON public.narrative_events(timestamp);
CREATE INDEX IF NOT EXISTS narrative_events_provenance_raw_idx ON public.narrative_events((provenance->>'raw_payload_id'));

ALTER TABLE public.narrative_events ENABLE ROW LEVEL SECURITY;

-- Dead letter queue for failed ingestion attempts
CREATE TABLE IF NOT EXISTS public.dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_payload_id UUID REFERENCES public.raw_payloads(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  error_code TEXT DEFAULT '',
  error_message TEXT,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  retry_count INT DEFAULT 0,
  batch_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS dead_letter_queue_source_idx ON public.dead_letter_queue(source);
CREATE INDEX IF NOT EXISTS dead_letter_queue_batch_id_idx ON public.dead_letter_queue(batch_id);

ALTER TABLE public.dead_letter_queue ENABLE ROW LEVEL SECURITY;

-- Replay queue for manual/automated reprocessing
CREATE TABLE IF NOT EXISTS public.replay_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_payload_id UUID NOT NULL REFERENCES public.raw_payloads(id) ON DELETE CASCADE,
  narrative_event_id UUID REFERENCES public.narrative_events(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS replay_queue_status_idx ON public.replay_queue(status);
CREATE INDEX IF NOT EXISTS replay_queue_raw_payload_id_idx ON public.replay_queue(raw_payload_id);

ALTER TABLE public.replay_queue ENABLE ROW LEVEL SECURITY;

-- Transcript batch status for admin UI
CREATE TABLE IF NOT EXISTS public.transcript_batch_status (
  batch_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'partial')),
  total_items INT DEFAULT 0,
  processed INT DEFAULT 0,
  failed INT DEFAULT 0,
  skipped INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.transcript_batch_status ENABLE ROW LEVEL SECURITY;

-- RLS enabled: no policies for anon/authenticated = no direct client access
-- Edge Functions use service role which bypasses RLS
