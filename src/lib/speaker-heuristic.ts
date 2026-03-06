/**
 * Speaker Entity Heuristic
 * Derives speaker_entity and speaker_role from source data patterns and content heuristics.
 * Deterministic mapping per event; fallbacks to "unknown" when unable to determine.
 */

const ROLE_PATTERNS: Array<{ pattern: RegExp; role: string }> = [
  { pattern: /\b(journalist|reporter|correspondent|writer|editor)\b/i, role: 'journalist' },
  { pattern: /\b(analyst|research\s+analyst|equity\s+analyst)\b/i, role: 'analyst' },
  { pattern: /\b(transcript|earnings\s+call|conference\s+call)\b/i, role: 'transcript_author' },
  { pattern: /\b(ceo|cfo|cto|executive|management)\b/i, role: 'executive' },
  { pattern: /\b(anchor|host|presenter)\b/i, role: 'studio_anchor' },
  { pattern: /\b(interview|interviewer)\b/i, role: 'interviewer' },
  { pattern: /\b(byline|by\s+)\b/i, role: 'journalist' },
  { pattern: /\b(press\s+release|pr\s+team)\b/i, role: 'press_release' },
  { pattern: /\b(investor|shareholder)\b/i, role: 'investor' },
]

const SOURCE_ROLE_MAP: Record<string, string> = {
  NewsAPI: 'journalist',
  newsapi: 'journalist',
  earnings_transcripts_batch: 'transcript_author',
  transcript: 'transcript_author',
  twitter: 'retail',
  x: 'retail',
  social: 'retail',
  api: 'unknown',
  web: 'unknown',
  mobile: 'unknown',
}

export interface SpeakerHeuristicResult {
  speaker_entity: string
  speaker_role: string
}

/**
 * Derive speaker_role from source string
 */
function roleFromSource(source: string): string {
  const s = (source ?? '').toLowerCase().trim()
  for (const [key, role] of Object.entries(SOURCE_ROLE_MAP)) {
    if (s.includes(key.toLowerCase())) return role
  }
  return 'unknown'
}

/**
 * Derive speaker_role from content/author/tags in payload
 */
function roleFromContent(payload: Record<string, unknown>): string | null {
  const author = String(payload?.author ?? payload?.byline ?? payload?.speaker ?? '')
  const tags = Array.isArray(payload?.tags) ? payload.tags : []
  const content = String(payload?.text ?? payload?.raw_text ?? payload?.content ?? '')
  const combined = [author, content, tags.join(' ')].filter(Boolean).join(' ')

  for (const { pattern, role } of ROLE_PATTERNS) {
    if (pattern.test(combined)) return role
  }
  return null
}

/**
 * Normalize speaker entity name from payload
 */
function normalizeEntity(payload: Record<string, unknown>): string {
  const author = payload?.author ?? payload?.byline ?? payload?.speaker_entity ?? payload?.speaker
  if (typeof author === 'string' && author.trim()) {
    return author.trim().slice(0, 200)
  }
  const source = String(payload?.source ?? '')
  if (source) {
    return `${source} Source`
  }
  return 'unknown'
}

/**
 * Derive speaker_entity and speaker_role from raw payload.
 * Deterministic: same input produces same output.
 */
export function deriveSpeakerHeuristic(payload: Record<string, unknown>, source: string): SpeakerHeuristicResult {
  const safePayload = payload != null && typeof payload === 'object' ? payload : {}
  const entity = normalizeEntity(safePayload)
  const roleFromContentResult = roleFromContent(safePayload)
  const roleFromSourceResult = roleFromSource(source ?? '')

  const speaker_role =
    roleFromContentResult ?? (roleFromSourceResult !== 'unknown' ? roleFromSourceResult : 'unknown')
  const speaker_entity = entity !== 'unknown' ? entity : 'unknown'

  return {
    speaker_entity,
    speaker_role,
  }
}
