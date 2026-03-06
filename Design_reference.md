# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Drilldown & Traceability UI

## Overview
Build a robust, production-ready Drilldown & Traceability UI for the Gbox360 Investor Perception Index (IPI) platform. The UI enables users to inspect the current IPI for a selected company, understand why the IPI moved, and drill down into the underlying NarrativeEvents. Features include: narrative discovery, paginated event lists with rich filtering, raw payload viewing, timeline replay controls, authority/credibility signals, and export of audit artifacts (signed JSON and PDF with integrity hashes). The system must guard against null/undefined values at runtime, support secure access control, and perform efficiently on large event datasets.

Associated Pages:
- page_core_008 (Company View / IPI Detail)
- page_core_007 (Drilldown — Why Did This Move?)

Project Context:
- Target audience: investors, analysts, and executives requiring auditable narratives behind IPI movements.
- Data model: immutable NarrativeEvent with canonical schema; raw payloads preserved for audit.
- MVP scope: headline IPI, direction, top narratives, drill-down explanation with event-level details, and artifact export.

CRITICAL runtime safety: follow the provided runtime safety rules in all generated code.

---

## Components to Build

1) Drilldown & Traceability UI Shell
- Purpose: Orchestrates navigation between Company View and Drilldown views, manages global state for selected company, time window, and current narrative/IPI focus.
- Technical details:
  - Routes: /company/:companyId/ipi-detail and /drilldown/:narrativeId
  - State: currentCompanyId, currentTimeWindow, selectedNarrativeId, viewMode (IPI vs drilldown)
  - Data loading: fetch IPI summary, top narratives, and timeline data for the company/time window
  - Accessibility: skip links, keyboard navigable, ARIA labeling for panels

2) Company View (IPI Detail)
- Purpose: Displays the selected company’s current IPI, directional change, top 3 contributing narratives, and a timeline. Button CTA to drill down to “Why did this move?”
- UI/UX specifics:
  - Hero section: IPI score (large numeric stat), directional indicator (↑/↓ with color cue), timestamp
  - Top narratives panel: 3 cards horizontally or in a responsive grid showing narrative title, short descriptor, and a small credibility badge
  - Timeline view: compact inline timeline with events; ability to scrub through to see how narratives accumulate
  - Drill-down CTA: prominent CTA button “Why did this move?” wired to /drilldown/:narrativeId
- Data interactions:
  - Fetch: company IPI summary, direction, top narratives, and timeline within selected window
  - Ensure all array-like data guarded with (data ?? []) and Array.isArray checks
- UI components:
  - Card surfaces for narratives with chips (narrative labels), numeric badges for scores
  - Timeline row with markers and hover tooltips
- Export/Actions:
  - Quick export of audit artifacts placeholder (signed JSON/PDF) available from drill-down path

3) Drilldown — Why Did This Move?
- Purpose: Detailed explanation for a selected narrative or IPI movement. Lists underlying NarrativeEvents with raw payload viewing, authority & credibility signals, timestamps, and a replayable chronological view.
- UI/UX specifics:
  - Narrative summary header: name, source, credibility weight, timestamp
  - Event list: paginated, sortable, and filterable by timestamp, source, authority weight
  - Raw payload viewer: modal or side panel to view full payload with syntax highlighting (JSON)
  - Authority & credibility signals: compact badges/chips indicating analysts, media, retail signals, and credibility scores
  - Replayable chronological view: small built-in player that steps through events in order with play/pause, speed controls, and scrubber
  - Export: ability to export selected drilldown artifacts
- Data interactions:
  - Fetch: NarrativeEvents by narrativeId or IPI movement window, with pagination, sorting, and filters
  - Ensure results guarded: const items = data ?? []; Array.isArray(items)
- UI components:
  - EventTable: rows with time, source, signal strength, credibility, payload preview toggle
  - PayloadViewerModal: shows raw payload, line-wrapped, copy-to-clipboard
  - ReplayTimeline: vertical/horizontal timeline with markers for each event
  - Action bar: export artifact, filter controls

4) Shared/Supporting Components
- Pagination controls
- Filters bar (source, time window, credibility level)
- Sign-off chips for provenance (source, model version, ingestion timestamp)
- Export modal/dialogs
- Loading skeletons and error banners
- Utilities:
  - safeArray(mapFn) helper: (Array.isArray(data) ? data.map(fn) : [])
  - ensureArray(data): data ?? []
  - safeAccess(obj, prop, defaultValue)

---

## Implementation Requirements

### Frontend
- Frameworks: React 18+ with TypeScript; state management via React hooks or lightweight context; optional Redux if justified.
- Routing: client-side routing with protected routes
- State and Data Handling:
  - Use useState/useEffect for local UI state; initialize arrays with []: useState<MyItem[]>([])
  - Always guard API responses:
    - const list = Array.isArray(response?.data) ? response.data : []
    - const items = data ?? []
  - Optional chaining for nested objects: obj?.payload?.raw
- Components and UI:
  - Reusable Card, Button, Chip, Dropdown, Modal, Tooltip components
  - Theming aligned to the provided color palette and typography
  - Data Visualization:
    - Lightweight, accessible charts (line/area) with minimal dependencies or a chosen chart library
    - Use #0F172A or #FF6B4A for primary lines; #6B7280 for secondary
    - Tooltips for timeline markers showing a payload snippet and timestamp
- Accessibility:
  - Keyboard navigable controls, proper ARIA roles, focus-visible outlines in #93C5FD
- Performance:
  - Debounced search/filter changes
  - Server-driven pagination for NarrativeEvents
  - Efficient rendering for large lists (virtualized list if data is large)
- Data Validation:
  - Validate inputs before requests; guard against null/undefined
- Export Artifacts:
  - Placeholder services to trigger artifact generation (signed JSON and PDF)
  - Include metadata: companyId, narrativeId, timeWindow, generationTimestamp, and integrity hash placeholder
- Security:
  - Ensure endpoints/components enforce authorization checks; UI should respect user roles for viewing exports and payloads

### Backend
- APIs:
  - GET /api/companies/{companyId}/ipi-detail?startDate=&endDate=&limit=&offset=
    - Returns: current IPI, direction, topN narratives (N=3), and a timeline
  - GET /api/narratives/{narrativeId}/events?limit=&offset=&sort=&filters=
    - Returns: paginated NarrativeEvents with fields: id, source, speaker, audience, rawPayload, timestamps, authoritySignal, credibilitySignal
  - POST /api/export/audit
    - Body: { companyId, narrativeId?, timeWindow, format: 'json'|'pdf' }
    - Returns: signed artifact URLs and metadata including a hash
- Data models:
  - NarrativeEvent
    - id: string
    - narrativeId: string
    - source: string
    - speaker: { name: string; role?: string }
    - audience: string
    - rawPayload: object
    - timestamp: string (ISO)
    - authoritySignal: number (0-1)
    - credibilitySignal: number (0-1)
  - IPISummary
    - currentValue: number
    - direction: 'up'|'down'|'flat'
    - timestamp: string
    - topNarratives: Array<{ narrativeId: string; title: string; score: number; credibility?: number }>
  - ArtifactMeta
    - id, companyId, narrativeId?, timeWindow, format, generatedAt, sha256
- Data safety:
  - Guard all responses: if response.data not an array, default to []
  - Use null-safe access in all tail code paths

### Integration
- Data flow:
  - User selects company/time window → Company View fetches IPI summary and top narratives
  - User clicks a top narrative → Drilldown loads narrative summary and event page
  - Drilldown page fetches NarrativeEvents with pagination; payload viewer fetches on demand
  - User triggers export → Backend creates signed artifact and returns URL
- State synchronization:
  - When narrative changes, fetch related events; update timeline playback state
  - Ensure consistent IDs between components for smooth drill-down transitions
- Error handling:
  - Global error boundary; user-friendly error banners
  - Fallback UI with empty-state guidance

---

## User Experience Flow

1) User authentication and landing
- User logs in and lands in the Investor Perception Dashboard
- Accessible global nav with company selector

2) Company View (IPI Detail)
- User selects a company and time window
- Page loads IPI summary:
  - Current IPI score: large numeric
  - Direction: Up or Down indicator with color cue
  - Timestamp
- Top 3 contributing narratives shown as cards:
  - Narrative title, a compact descriptor, score, credibility chip
- Timeline component shows events contributing to current IPI movement
- CTA: “Why did this move?” on each narrative or a global CTA to drill down

3) Drilldown — Why Did This Move?
- User clicks the drill-down CTA or selects a top narrative
- Drilldown header shows narrative name, origin, credibility signals, and time window
- Event list loads with pagination:
  - Columns: timestamp, source, signal strength, credibility, quick action
  - Each row can reveal a short payload snippet with a toggle
- Raw Payload Viewing:
  - Open a modal to view the full raw payload with syntax highlighting
  - Copy-to-clipboard available
- Authority & Credibility Signals:
  - Chips/badges per event or grouped by signal type
- Replayable Chronological View:
  - Timeline scrubber with play/pause; step through events in order
  - Playback speed controls
  - Hover over markers to preview event summary
- Export:
  - Export artifacts for the drilldown as signed JSON and PDF with a progress indicator
  - Export includes metadata and integrity hash placeholder

4) Export Artifacts and Exit
- User can download artifacts or obtain signed URLs
- Validations ensure only authorized users can export

---

## Technical Specifications

Data Models (Schemas)
- NarrativeEvent
  - id: string
  - narrativeId: string
  - source: string
  - speaker: { name: string; role?: string }
  - audience: string
  - rawPayload: unknown
  - timestamp: string
  - authoritySignal: number
  - credibilitySignal: number
- Narrative
  - id: string
  - title: string
  - summary: string
  - narrativeType: string
- IPISummary
  - currentValue: number
  - direction: 'up'|'down'|'flat'
  - timestamp: string
  - topNarratives: Array<{ narrativeId: string; title: string; score: number; credibility?: number }>
- ArtifactMeta
  - id: string
  - companyId: string
  - narrativeId?: string
  - timeWindow: { start: string; end: string }
  - format: 'json'|'pdf'
  - generatedAt: string
  - sha256: string

API Endpoints (Routes and Methods)
- GET /api/companies/{companyId}/ipi-detail
  - Query: startDate, endDate, limit, offset
  - Response: { currentValue, direction, timestamp, topNarratives: [{ narrativeId, title, score, credibility }], timeline: [...] }
- GET /api/narratives/{narrativeId}/events
  - Query: limit, offset, sort, filters
  - Response: { items: NarrativeEvent[], total: number }
- POST /api/export/audit
  - Body: { companyId, narrativeId?, timeWindow: {start, end}, format }
  - Response: { url, artifactMeta }

Security and Access Control
- Ensure authentication tokens/ sessions are validated
- Authorization checks to confirm user access to company data and to exports/payloads
- Sensitive payloads require proper permission; hide or redact fields if needed
- API responses guarded with explicit checks for presence of required fields

Validation
- Validate all inputs both client- and server-side
- For arrays: use Array.isArray(data) ? data : []
- For API response shapes: const list = Array.isArray(response?.data) ? response.data : []
- Optional chaining for nested fields: obj?.field?.subfield
- Destructure with defaults: const { items = [], total = 0 } = response ?? {}

Performance
- Pagination for NarrativeEvents; server-side paging to prevent large payloads
- Debounce search and filter inputs
- Efficient rendering: use memoization for heavy computations; virtualization if event lists are large

Testing Criteria
- Frontend:
  - [ ] IPI detail page renders with correct values from API
  - [ ] Top narratives render with correct counts and badges
  - [ ] Drilldown loads narrative events with pagination
  - [ ] Raw payload modal displays valid JSON and copy works
  - [ ] Timeline replay controls function (play/pause/seek)
  - [ ] Export artifacts endpoint returns signed URLs and metadata
  - [ ] All arrays are safely guarded against null/undefined
- Backend:
  - [ ] Endpoints return data with correct shapes; missing arrays default to []
  - [ ] Pagination and filters apply correctly
  - [ ] Artifact export returns signed artifacts with metadata
  - [ ] Authorization checks enforced
- End-to-end:
  - [ ] User can drill from IPI detail to Why Did This Move? drilldown and retrieve event data
  - [ ] Export artifacts reflect the current drilldown context

UI/UX Guidelines
- Apply the project's design system consistently
- Maintain the color palette and typography as specified
- Ensure visual hierarchy aligns with the specified scales
- Soft shadows, clean surfaces, and restrained use of accent colors
- Micro-interactions: 150–220ms hover transitions; 300ms panel transitions
- Accessibility: high-contrast text, focus rings (#93C5FD), semantic HTML, proper ARIA roles

Visual Style Matching
- Card surfaces: white with light border, rounded corners 10–12px, subtle shadow
- Navigation: top bar with brand mark, active states with accent cues
- Data Visualization: minimal lines and dots; ensure text remains legible against backgrounds
- CTAs: primary CTAs in #0F172A with white text; secondary outlined in #E5E7EB

Mandatory Coding Standards — Runtime Safety
- Supabase/API results: Always use nullish coalescing for results: const items = data ?? []
- Array methods: Guard every call
  - (items ?? []).map(...)
  - Array.isArray(items) ? items.filter(...) : []
- React useState for arrays: useState<MyType[]>([])
- API response shapes: const list = Array.isArray(response?.data) ? response.data : []
- Optional chaining: obj?.prop?.nested
- Destructuring with defaults: const { items = [], count = 0 } = response ?? {}

--- 

If you need, I can convert this into an actionable project brief with task breakdowns, acceptance tests as concrete Jest/RTL tests, and a minimal starter repo layout (folders, components, hooks, and API clients) tailored to your existing tech stack (React TS, Next.js, or your preferred framework).

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
