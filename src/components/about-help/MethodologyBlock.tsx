import { SectionCard } from './SectionCard'

const IPI_FORMULA = 'IPI = 0.4 × Narrative + 0.4 × Credibility + 0.2 × Risk'

export function MethodologyBlock() {
  return (
    <SectionCard
      id="methodology"
      title="Methodology"
      meta="How the Investor Perception Index is computed"
    >
      <div className="prose prose-slate max-w-none text-base">
        <p className="text-muted-foreground leading-relaxed">
          The Investor Perception Index (IPI) is an explainable, audit-first metric built from
          constrained external signals: news (NewsAPI), social (X/Twitter read-only), and batch
          earnings transcripts (S3). All raw payloads are preserved in an append-only store and
          normalized into a canonical <strong className="text-foreground">NarrativeEvent</strong> model.
        </p>

        <h3 className="mt-8 text-lg font-semibold text-foreground">NarrativeEvent Schema</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Each event captures provenance and metadata for full traceability:
        </p>
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
          <code className="text-sm text-foreground break-all">
            event_id, raw_payload_id, source, platform, speaker_entity, speaker_role,
            audience_class, raw_text, ingestion_timestamp, original_timestamp, metadata,
            authority_score, credibility_flags
          </code>
        </div>

        <h3 className="mt-8 text-lg font-semibold text-foreground">IPI Calculation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The index uses provisional weights (configurable and logged):
        </p>
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-foreground">
          {IPI_FORMULA}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Weights are provisional; every export includes input vectors and weight version for
          reproducibility.
        </p>

        <ul className="mt-6 space-y-3 list-none pl-0">
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold">
              1
            </span>
            <div>
              <strong className="text-foreground">Topic classification:</strong>{' '}
              <span className="text-muted-foreground">
                Rule-based keywords first; optional embeddings for clustering. Time-decayed
                persistence metric for narrative scoring.
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold">
              2
            </span>
            <div>
              <strong className="text-foreground">Authority weighting:</strong>{' '}
              <span className="text-muted-foreground">
                Analyst &gt; Media &gt; Retail tiers applied during aggregation.
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold">
              3
            </span>
            <div>
              <strong className="text-foreground">Auditability:</strong>{' '}
              <span className="text-muted-foreground">
                Raw payloads preserved; signed artifacts with integrity hashes; full provenance
                for every score.
              </span>
            </div>
          </li>
        </ul>

        <div className="mt-8 rounded-lg border border-success/30 bg-success/5 p-4">
          <p className="text-sm font-medium text-foreground">Audit-first design</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No black-box sentiment dashboards. Explicit, provisional weights and visible inputs
            for board-credible decision-making.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
