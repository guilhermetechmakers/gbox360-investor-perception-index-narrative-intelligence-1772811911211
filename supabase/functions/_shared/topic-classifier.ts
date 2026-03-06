/**
 * Rule-based topic classifier for narratives.
 * Keyword-to-topic mapping with confidence scoring.
 * Fallback to "unknown" if no match.
 */
export interface TopicLabel {
  topic: string
  confidence: number
}

export interface TopicClassificationResult {
  top_topic_labels: TopicLabel[]
  primary_topic: string
  clustering_id: string | null
  explanation: string
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'earnings-guidance': ['earnings', 'guidance', 'revenue', 'profit', 'margin', 'outlook', 'forecast', 'beat', 'miss'],
  'management-tone': ['management', 'ceo', 'cfo', 'executive', 'leadership', 'tone', 'confidence', 'cautious'],
  'analyst-coverage': ['analyst', 'rating', 'upgrade', 'downgrade', 'price target', 'buy', 'sell', 'hold'],
  'esg-sustainability': ['esg', 'sustainability', 'carbon', 'climate', 'environmental', 'social', 'governance'],
  'mergers-acquisitions': ['merger', 'acquisition', 'm&a', 'deal', 'takeover', 'buyout'],
  'innovation-rd': ['innovation', 'r&d', 'research', 'development', 'patent', 'technology'],
  'market-sentiment': ['sentiment', 'market', 'investor', 'bullish', 'bearish', 'volatility'],
  'regulatory': ['regulation', 'regulatory', 'sec', 'fda', 'compliance', 'approval'],
}

function normalizeText(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function classifyNarrative(text: string): TopicClassificationResult {
  const normalized = normalizeText(text)
  if (!normalized) {
    return {
      top_topic_labels: [{ topic: 'unknown', confidence: 0 }],
      primary_topic: 'unknown',
      clustering_id: null,
      explanation: 'Empty or missing text',
    }
  }

  const scores: Record<string, number> = {}
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        score += 1
      }
    }
    if (score > 0) {
      scores[topic] = Math.min(score / keywords.length, 1)
    }
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic, conf]) => ({ topic, confidence: Math.round(conf * 100) / 100 }))

  const primary = sorted[0]?.topic ?? 'unknown'
  const topLabels: TopicLabel[] = sorted.length > 0
    ? sorted
    : [{ topic: 'unknown', confidence: 0.5 }]

  return {
    top_topic_labels: topLabels,
    primary_topic: primary,
    clustering_id: null,
    explanation: sorted.length > 0
      ? `Matched keywords for: ${topLabels.map((t) => t.topic).join(', ')}`
      : 'No keyword match; defaulting to unknown',
  }
}
