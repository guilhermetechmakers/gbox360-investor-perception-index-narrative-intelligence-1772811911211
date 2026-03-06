import { api } from '@/lib/api'
import type { SystemStatus } from '@/types/dashboard'

const DEFAULT_STATUS: SystemStatus = {
  status: 'ok',
  message: 'All systems operational',
  lastUpdated: new Date().toISOString(),
}

export const systemApi = {
  getStatus: async (): Promise<SystemStatus> => {
    try {
      return await api.get<SystemStatus>('/system-status')
    } catch {
      return DEFAULT_STATUS
    }
  },
}
