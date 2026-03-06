# Gbox360 — Investor Perception Index & Narrative Intelligence

This project was created with ScopesFlow automation.

## Landing Page

The public landing page (`/`) is built from modular components in `src/components/landing/`:

- **LandingHero** — Hero with title, subtitle, and CTAs (Sign up, Request demo, Explore sample IPI)
- **HowItWorks** — 3-step flow: Ingest → Canonicalize → Explain IPI
- **SampleIPISnapshot** — Static IPI preview with score, direction, and top narratives
- **FeatureHighlights** — Feature cards (NarrativeEvent model, audit export, drill-downs, governance)
- **TrustCompliance** — Auditability and data retention statements
- **FooterLinks** — Policy links and contact form

### Replacing static content with CMS-driven data

To drive landing content from a CMS:

1. **Runtime safety**: Always guard arrays and optional data:
   - `const items = data ?? []` or `Array.isArray(data) ? data : []`
   - Use optional chaining: `content?.sections?.length ?? 0`
   - Destructure with defaults: `const { items = [] } = response ?? {}`

2. **Component props**: Each component accepts optional content props (e.g. `steps`, `features`, `topNarratives`). Pass CMS data into these props after validation.

3. **Stub endpoints** (when integrating a CMS):
   - `GET /api/landing-content` → `{ sections: PageSection[] }`
   - `GET /api/landing-snapshot` → `{ score, direction, topNarratives }`

4. **Validation**: Validate CMS responses with Zod before passing to components. Ensure lists default to `[]` when invalid.
