export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
  dismissible?: boolean
  pinned?: boolean
  createdAt: number
}

export interface PushToastOptions {
  id?: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
  dismissible?: boolean
  pinned?: boolean
}

export interface ToastContextValue {
  toasts: ToastData[]
  pushToast: (options: PushToastOptions) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
  pinToast: (id: string, pinned: boolean) => void
}
