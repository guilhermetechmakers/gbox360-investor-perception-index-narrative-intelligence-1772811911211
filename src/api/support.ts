import { api } from '@/lib/api'

export type SupportTopic = 'General Support' | 'Demo Request' | 'Other'

export interface SupportTicketPayload {
  name: string
  email: string
  company: string
  topic: SupportTopic
  message: string
  consent: boolean
}

export interface SupportTicketResponse {
  success: boolean
  ticketId?: string
  error?: string
}

export async function submitSupportTicket(
  payload: SupportTicketPayload
): Promise<SupportTicketResponse> {
  try {
    const response = await api.post<SupportTicketResponse>('/support/tickets', payload)
    return response ?? { success: false, error: 'Unknown error' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.'
    return { success: false, error: msg }
  }
}

export const supportApi = {
  submitTicket: submitSupportTicket,
}
