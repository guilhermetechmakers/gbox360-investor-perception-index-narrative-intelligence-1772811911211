import { ToSLayout, DEFAULT_TOS_CONTENT } from '@/components/terms-of-service'

/**
 * Terms of Service page.
 * Uses static default content. Structure supports future CMS/API fetch:
 * - Optional GET /api/tos returns { version, lastUpdated, sections }
 * - Graceful fallback to DEFAULT_TOS_CONTENT when data is missing
 */
export function Terms() {
  const { sections = [], version = '1.0', lastUpdated = '' } = DEFAULT_TOS_CONTENT
  const safeSections = Array.isArray(sections) ? sections : []

  return (
    <ToSLayout
      title="Terms of Service"
      sections={safeSections}
      lastUpdated={lastUpdated}
      version={version}
      showAcceptBanner={false}
    />
  )
}
