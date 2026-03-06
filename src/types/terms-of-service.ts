/**
 * Terms of Service data models.
 * Prepared for future CMS/API integration.
 */

export interface TosSubsection {
  heading: string
  text: string
}

export interface TosSection {
  id: string
  heading: string
  body: string
  subsections?: TosSubsection[]
  listItems?: string[]
  isImportant?: boolean
  isDisclaimer?: boolean
}

export interface TosContent {
  version: string
  lastUpdated: string
  sections: TosSection[]
  notes?: string[]
}
