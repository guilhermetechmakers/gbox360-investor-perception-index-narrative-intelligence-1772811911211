# Canonical NarrativeEvent Schema Documentation

Human-readable, developer-friendly documentation of the NarrativeEvent schema for the Gbox360 Investor Perception Index (IPI) platform, including Credibility Proxy & Risk Signals.

---

## Schema Definition Reference

### Core Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `event_id` | UUID | No | Primary key, auto-generated |
| `raw_payload_id` | UUID | No | FK to raw_payloads; links to archived payload |
| `source` | TEXT | No | Source platform (e.g., news, transcript, social) |
| `platform` | TEXT | No | Platform identifier, default `unknown` |
| `speaker_entity` | TEXT | No | Heuristic speaker/entity name |
| `speaker_role` | TEXT | No | Heuristic role (e.g., CEO, analyst) |
| `audience_class` | TEXT | No | Audience classification |
| `raw_text` | TEXT | No | Canonical text content |
| `ingestion_timestamp` | TIMESTAMPTZ | No | When the event was ingested |
| `original_timestamp` | TIMESTAMPTZ | No | When the event occurred |
| `metadata` | JSONB | No | Flexible metadata (company_ticker, etc.) |
| `authority_score` | NUMERIC(5,4) | Yes | 0–1 authority weight |
| `credibility_flags` | JSONB | Yes | Legacy credibility flags |
| `provenance` | JSONB | No | Operator, ingest system, write timestamp |
| `created_at` | TIMESTAMPTZ | No | Row creation time |

### Credibility & Risk Signals (V2)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `credibility_score` | NUMERIC(5,4) | Yes | 0–1 credibility proxy score |
| `risk_score` | NUMERIC(5,4) | Yes | 0–1 risk proxy score |
| `signals` | JSONB | Yes | Array of SignalRecord |

### SignalRecord Shape (embedded in `signals`)

```json
{
  "id": "uuid",
  "narrative_id": "uuid",
  "type": "management_language_consistency | repetition_consistency | negative_earnings_language | legal_governance_words",
  "description": "Human-readable descriptor",
  "weight": 0.0,
  "source": "source platform",
  "detected_at": "ISO8601 timestamp"
}
```

---

## Field Definitions

### source / platform

- **source**: Primary source (e.g., `news`, `transcript`, `social`)
- **platform**: Sub-platform or channel
- Used for filtering and authority weighting

### speaker_entity / speaker_role

- Heuristic extraction from raw payload
- `speaker_entity`: Name or identifier
- `speaker_role`: Role (CEO, CFO, analyst, etc.)

### audience_class

- Classification of intended audience (investors, retail, etc.)

### raw_text

- Canonical text content used for signal detection
- Non-empty string required for ingestion

### Timestamps

- **created_at**: Row insertion time
- **updated_at**: Not used (append-only)
- **ingestion_timestamp**: When event entered the system
- **event_time** / **original_timestamp**: When the event occurred

### provenance

```json
{
  "operator_id": "string",
  "ingest_system_id": "string",
  "write_timestamp": "ISO8601",
  "version": "string",
  "raw_payload_id": "uuid"
}
```

### signals

- Array of SignalRecord
- Append-only; new signals added, historical preserved
- Types: `management_language_consistency`, `repetition_consistency`, `negative_earnings_language`, `legal_governance_words`

### related_narratives

- Linkage to narrative clusters (via metadata or separate table)
- Optional; used for narrative aggregation

---

## Example Payloads

### With signals populated

```json
{
  "event_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "raw_payload_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "source": "transcript",
  "platform": "earnings-call",
  "speaker_entity": "CEO",
  "speaker_role": "Chief Executive Officer",
  "audience_class": "investors",
  "raw_text": "We expect strong demand to continue. Management stated \"we are confident in our guidance.\"",
  "ingestion_timestamp": "2025-03-06T12:00:00Z",
  "original_timestamp": "2025-03-05T14:30:00Z",
  "metadata": { "company_ticker": "ACME" },
  "authority_score": 0.85,
  "credibility_score": 0.72,
  "risk_score": 0.15,
  "signals": [
    {
      "id": "s1",
      "narrative_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "management_language_consistency",
      "description": "Quotes: 1, assertive: 2, hedging: 0",
      "weight": 0.7,
      "source": "transcript",
      "detected_at": "2025-03-06T12:00:00Z"
    }
  ],
  "provenance": {
    "operator_id": "ingest-v1",
    "write_timestamp": "2025-03-06T12:00:00Z"
  }
}
```

### With missing fields (backward compatible)

```json
{
  "event_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "raw_payload_id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "source": "news",
  "platform": "unknown",
  "speaker_entity": "unknown",
  "speaker_role": "unknown",
  "audience_class": "unknown",
  "raw_text": "Company reports earnings miss.",
  "ingestion_timestamp": "2025-03-06T12:00:00Z",
  "original_timestamp": "2025-03-06T10:00:00Z",
  "metadata": {},
  "authority_score": null,
  "credibility_flags": null,
  "credibility_score": null,
  "risk_score": null,
  "signals": [],
  "provenance": {}
}
```

---

## Migration Strategy

### V1 (Baseline)

- Core fields: event_id, raw_payload_id, source, platform, speaker_*, audience_class, raw_text, timestamps, metadata, authority_score, credibility_flags, provenance

### V2 (Credibility & Risk Signals)

- Add columns: `credibility_score`, `risk_score`, `signals`
- Example migration:

```sql
-- 20250306120000_add_credibility_risk_signals.sql
ALTER TABLE narrative_event_append
  ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(5,4) CHECK (credibility_score IS NULL OR (credibility_score >= 0 AND credibility_score <= 1)),
  ADD COLUMN IF NOT EXISTS risk_score NUMERIC(5,4) CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 1)),
  ADD COLUMN IF NOT EXISTS signals JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_narrative_event_credibility ON narrative_event_append (credibility_score) WHERE credibility_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_narrative_event_risk ON narrative_event_append (risk_score) WHERE risk_score IS NOT NULL;
```

- Backward compatibility: All new columns nullable; default `signals` to `[]`
- Backfill: Run re-score job (`POST /signals-recompute`) for historical data

### V3 (Future)

- Optional: Separate `signal_records` table for append-only signal lineage
- Optional: Indexes for signal type, weight range

---

## Validation Rules

| Rule | Implementation |
|------|----------------|
| `raw_text` non-empty | Required at ingest |
| `event_time` / `original_timestamp` valid | ISO8601 parseable |
| `provenance.source_url` valid URL | If present |
| `signals` array of SignalRecord | Each with type, description, weight |
| `credibility_score`, `risk_score` 0–1 | CHECK constraint |
| Array safety | Use `data ?? []`, `Array.isArray()` |

---

## API / DB Integration

### How signals are computed

- **Ingest path**: `computeSignals()` runs in the **narratives** Edge Function on POST (see `supabase/functions/narratives/index.ts`)
- **Re-score path**: `POST /functions/v1/signals-recompute` with body `{ narrative_ids?, window?, company_id?, start?, end? }` (see `supabase/functions/signals-recompute/index.ts`)
- Signals engine: `supabase/functions/_shared/signals-engine.ts` (regex-based credibility and risk detectors)

### Indexing strategy

- `credibility_score`, `risk_score`: B-tree indexes for range queries
- `signals`: GIN index for JSONB containment
- `original_timestamp`, `source`: Existing indexes

### Query patterns

```sql
-- Events with high credibility
SELECT * FROM narrative_event_append
WHERE credibility_score >= 0.7
  AND original_timestamp BETWEEN $1 AND $2;

-- Events with risk signals
SELECT * FROM narrative_event_append
WHERE risk_score >= 0.5
  AND metadata->>'company_ticker' ILIKE $1;
```

---

## Handling Missing Data

- **Arrays**: `const items = data ?? []`; `Array.isArray(data) ? data : []`
- **Nested**: `obj?.payload?.raw`
- **Defaults**: `credibility_score ?? 0.5` (neutral), `risk_score ?? 0`, `signals ?? []`
