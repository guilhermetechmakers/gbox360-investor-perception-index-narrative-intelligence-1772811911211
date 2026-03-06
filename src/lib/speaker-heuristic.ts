/**
 * Speaker Entity Heuristic - derives speaker_role from source data patterns
 * Deterministic mapping per event. Fallbacks: "unknown" / "unknown"
 */

const SOURCE_ROLE_MAP: Record<string, string> = {
  newsapi: 'journalist',
  news: 'journalist',
  techcrunch: 'journalist',
  reuters: 'journalist',
  bloomberg: 'journalist',
  transcript: 'transcript_author',
  earnings_transcripts_batch: 'transcript_author',
  earnings: 'analyst',
  analyst: 'analyst',
  twitter: 'retail',
  x: 'retail',
  social: 'retail',
  api: 'unknown',
}

const BYLINE_PATTERNS = [
  { pattern: /correspondent|reporter|journalist/i, role: 'journalist' },
  { pattern: /analyst|strategist|research/i, role: 'analyst' },
  { pattern: /ceo|cfo|executive|management/i, role: 'executive' },
  { pattern: /anchor|host|presenter/i, role: 'studio_anchor' },
  { pattern: /interview|q&a|question/i, role: 'interviewer' },
]

export interface SpeakerHeuristicResult {
  speaker_entity: string
  speaker_role: string
}

/**
 * Derive speaker_entity and speaker_role from raw payload or known fields.
 * Uses source patterns, content heuristics, and fallbacks.
 */
export function deriveSpeakerHeuristic(
  source: string,
  _platform?: string,
  rawPayload?: Record<string, unknown>,
  existingEntity?: string,
  existingRole?: string
): SpeakerHeuristicResult {
  const src = (source ?? '').toLowerCase().trim()
  const entity = (existingEntity ?? '').trim()
  const role = (existingRole ?? '').trim()

  if (entity && role) {
    return { speaker_entity: entity, speaker_role: role }
  }

  let derivedEntity = entity || 'unknown'
  let derivedRole = role || 'unknown'

  for (const [key, r] of Object.entries(SOURCE_ROLE_MAP)) {
    if (src.includes(key)) {
      derivedRole = r
      if (!entity) {
        derivedEntity = key.replace(/_/g, ' ')
        if (key === 'earnings_transcripts_batch') derivedEntity = 'Earnings Transcript'
        if (key === 'newsapi') derivedEntity = 'News Source'
      }
      break
    }
  }

  if (rawPayload && derivedRole === 'unknown') {
    const author = rawPayload.author ?? rawPayload.byline ?? rawPayload.speaker ?? rawPayload.source
    const authorStr = typeof author === 'string' ? author : ''
    const text = typeof rawPayload.text === 'string' ? rawPayload.text : String(rawPayload.content ?? rawPayload.raw_text ?? '')

    if (authorStr) {
      derivedEntity = authorStr
      for (const { pattern, role: r } of BYLINE_PATTERNS) {
        if (pattern.test(authorStr)) {
          derivedRole = r
          break
        }
      }
    }

    if (derivedRole === 'unknown' && text) {
      for (const { pattern, role: r } of BYLINE_PATTERNS) {
        if (pattern.test(text)) {
          derivedRole = r
          break
        }
      }
    }
  }

  return {
    speaker_entity: derivedEntity || 'unknown',
    speaker_role: derivedRole || 'unknown',
  }
}
