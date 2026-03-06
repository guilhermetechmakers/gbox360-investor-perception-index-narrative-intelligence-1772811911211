-- Credibility Proxy & Risk Signals
-- Add credibility_score, risk_score, and signals JSONB to narrative_event_append.
-- Append-only semantics: signals are computed at ingest or via re-score job.

-- Add new columns (nullable for backward compatibility)
ALTER TABLE public.narrative_event_append
  ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(5,4) CHECK (credibility_score IS NULL OR (credibility_score >= 0 AND credibility_score <= 1)),
  ADD COLUMN IF NOT EXISTS risk_score NUMERIC(5,4) CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 1)),
  ADD COLUMN IF NOT EXISTS signals JSONB DEFAULT '[]'::jsonb;

-- Index for querying by credibility/risk
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_credibility_score
  ON public.narrative_event_append(credibility_score) WHERE credibility_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_risk_score
  ON public.narrative_event_append(risk_score) WHERE risk_score IS NOT NULL;

-- GIN index for signals JSONB (e.g. filtering by signal type)
CREATE INDEX IF NOT EXISTS idx_narrative_event_append_signals_gin
  ON public.narrative_event_append USING GIN (signals);

COMMENT ON COLUMN public.narrative_event_append.credibility_score IS 'Credibility proxy score 0-1 (management language, repetition consistency)';
COMMENT ON COLUMN public.narrative_event_append.risk_score IS 'Risk proxy score 0-1 (negative earnings, legal/governance)';
COMMENT ON COLUMN public.narrative_event_append.signals IS 'Array of SignalRecord: type, description, weight, source, detected_at';
