/**
 * Privacy Policy data models.
 * Prepared for future CMS/API integration.
 */

export interface PolicySection {
  id: string
  title: string
  content: string
  order: number
  subsections?: PolicySubsection[]
}

export interface PolicySubsection {
  id: string
  title: string
  content: string
}

export interface RetentionRow {
  id: string
  category: string
  retentionPeriod: string
  rationale: string
  archivingMethod: string
}

export interface ContactInfo {
  email?: string
  phone?: string
  address?: string
  dataRequestUrl?: string
}

export interface PrivacyPolicyData {
  policySections?: PolicySection[]
  retentionData?: RetentionRow[]
  contactInfo?: ContactInfo | null
}

export type DataRequestType = 'access' | 'correction' | 'deletion' | 'portability' | 'withdraw_consent' | 'other'
