/**
 * Credibility Proxy & Risk Signals Engine
 * Detects crude credibility proxies and risk indicators from NarrativeEvent text.
 * Used at ingestion and by the re-score pipeline. Null-safe; returns 0–1 scores.
 */

export type SignalType =
  | 'management_language_consistency'
  | 'repetition_consistency'
  | 'negative_earnings_language'
  | 'legal_governance_words'

export interface SignalRecord {
  id: string
  narrative_id: string
  type: SignalType | string
  description: string
  weight: number
  source: string
  detected_at: string
}

export interface SignalsEngineInput {
  raw_text: string
  source_platform?: string
  speaker_entity?: string
  speaker_role?: string
  audience_class?: string
  event_time?: string
  source?: string
}

export interface SignalsEngineOutput {
  credibility_score: number
  risk_score: number
  signals: SignalRecord[]
}

const UUID = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })

function normalizeText(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const MANAGEMENT_QUOTE = /"[^"]+"|'[^']+'/g
const HEDGING = /\b(may|might|could|possibly|perhaps|likely|unclear|uncertain)\b/gi
const ASSERTIVE = /\b(will|commit|confirmed|certain|definitely|clearly)\b/gi

function countRepeatedPhrases(text: string, minLen = 4): number {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/).filter((w) => w.length >= 2)
  const seen = new Map<string, number>()
  for (let i = 0; i <= words.length - minLen; i++) {
    const phrase = words.slice(i, i + minLen).join(' ')
    seen.set(phrase, (seen.get(phrase) ?? 0) + 1)
  }
  let repeats = 0
  for (const c of seen.values()) {
    if (c > 1) repeats += c - 1
  }
  return repeats
}

const NEG_EARNINGS = /\b(miss|missed|missing|shortfall|warning|deteriorat|weaker|cut guidance|below consensus|non-gaap|write-?down|impairment)\b/gi
const LEGAL_GOV = /\b(lawsuit|litigation|investigation|subpoena|sec investigation|doj|regulatory action|fine|penalty|restatement|governance concern|fraud)\b/gi

const SOURCE_AUTHORITY_WEIGHT: Record<string, number> = {
  filing: 0.9,
  transcript: 0.85,
  press_release: 0.8,
  conference: 0.75,
  news: 0.5,
  social: 0.2,
  unknown: 0.3,
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, Number(n) || 0))
}

export function computeSignals(
  input: SignalsEngineInput,
  narrativeId: string
): SignalsEngineOutput {
  const rawText = input?.raw_text ?? ''
  const now = new Date().toISOString()
  const source = (input?.source_platform ?? input?.source ?? 'unknown').toLowerCase()
  const authorityWeight = SOURCE_AUTHORITY_WEIGHT[source] ?? 0.4

  const signals: SignalRecord[] = []
  let credibilitySum = 0
  let credibilityCount = 0
  let riskSum = 0
  let riskCount = 0

  const quotes = (rawText.match(MANAGEMENT_QUOTE) ?? []).length
  const hedging = (rawText.match(HEDGING) ?? []).length
  const assertive = (rawText.match(ASSERTIVE) ?? []).length
  const managementScore =
    quotes > 0
      ? clamp01(0.3 + (0.4 * Math.min(quotes, 3)) / 3 + (assertive > hedging ? 0.3 : 0))
      : 0
  if (managementScore > 0 || quotes > 0) {
    const weight = clamp01(managementScore * authorityWeight)
    credibilitySum += weight
    credibilityCount += 1
    signals.push({
      id: UUID(),
      narrative_id: narrativeId,
      type: 'management_language_consistency',
      description: quotes > 0 ? 'Direct quotes from management' : 'Management language cues',
      weight,
      source: source || 'unknown',
      detected_at: now,
    })
  }

  const repeats = countRepeatedPhrases(rawText)
  const repetitionScore = clamp01(Math.min(repeats / 5, 1) * 0.5 + 0.3 * authorityWeight)
  if (repeats > 0) {
    const weight = clamp01(repetitionScore)
    credibilitySum += weight
    credibilityCount += 1
    signals.push({
      id: UUID(),
      narrative_id: narrativeId,
      type: 'repetition_consistency',
      description: `Recurring phrases (${repeats} repeats)`,
      weight,
      source: source || 'unknown',
      detected_at: now,
    })
  }

  const negMatches = (rawText.match(NEG_EARNINGS) ?? []).length
  const negScore = clamp01(Math.min(negMatches / 4, 1))
  if (negMatches > 0) {
    riskSum += negScore
    riskCount += 1
    signals.push({
      id: UUID(),
      narrative_id: narrativeId,
      type: 'negative_earnings_language',
      description: `Negative earnings language (${negMatches} matches)`,
      weight: negScore,
      source: source || 'unknown',
      detected_at: now,
    })
  }

  const legalMatches = (rawText.match(LEGAL_GOV) ?? []).length
  const legalScore = clamp01(Math.min(legalMatches / 3, 1))
  if (legalMatches > 0) {
    riskSum += legalScore
    riskCount += 1
    signals.push({
      id: UUID(),
      narrative_id: narrativeId,
      type: 'legal_governance_words',
      description: `Legal/governance mentions (${legalMatches} matches)`,
      weight: legalScore,
      source: source || 'unknown',
      detected_at: now,
    })
  }

  const credibility_score =
    credibilityCount > 0
      ? clamp01(credibilitySum / Math.max(credibilityCount, 1))
      : clamp01(0.3 * authorityWeight)
  const risk_score =
    riskCount > 0 ? clamp01(riskSum / Math.max(riskCount, 1)) : 0

  return { credibility_score, risk_score, signals }
}
