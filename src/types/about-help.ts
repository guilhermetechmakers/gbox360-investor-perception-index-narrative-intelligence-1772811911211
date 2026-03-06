export type SupportTopic = 'General Support' | 'Demo Request' | 'Other'

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface RoadmapItem {
  id: string
  title: string
  status?: 'alpha' | 'beta' | 'planned'
}
