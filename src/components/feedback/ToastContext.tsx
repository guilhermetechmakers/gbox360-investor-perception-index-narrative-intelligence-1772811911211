import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ToastData, PushToastOptions, ToastContextValue } from './toast-types'

const DEFAULT_DURATION = 5000

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearTimeoutForId = useCallback((id: string) => {
    const existing = timeoutsRef.current.get(id)
    if (existing) {
      clearTimeout(existing)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const pushToast = useCallback((options: PushToastOptions): string => {
    const id = options.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const toast: ToastData = {
      id,
      title: options.title ?? 'Notification',
      description: options.description,
      type: options.type ?? 'default',
      duration: options.duration ?? DEFAULT_DURATION,
      dismissible: options.dismissible ?? true,
      pinned: options.pinned ?? false,
      createdAt: Date.now(),
    }

    setToasts((prev) => {
      const filtered = prev.filter((t) => t.id !== id)
      return [...filtered, toast]
    })

    if (!toast.pinned && typeof toast.duration === 'number' && toast.duration > 0) {
      const timeoutId = setTimeout(() => {
        timeoutsRef.current.delete(id)
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration)
      timeoutsRef.current.set(id, timeoutId)
    }

    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    clearTimeoutForId(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [clearTimeoutForId])

  const clearToasts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current.clear()
    setToasts([])
  }, [])

  const pinToast = useCallback(
    (id: string, pinned: boolean) => {
      if (pinned) {
        clearTimeoutForId(id)
      }
      setToasts((prev) => {
        const t = prev.find((x) => x.id === id)
        const next = prev.map((x) => (x.id === id ? { ...x, pinned } : x))
        if (!pinned && t && typeof t.duration === 'number' && t.duration > 0) {
          const timeoutId = setTimeout(() => {
            timeoutsRef.current.delete(id)
            setToasts((p) => p.filter((x) => x.id !== id))
          }, t.duration)
          timeoutsRef.current.set(id, timeoutId)
        }
        return next
      })
    },
    [clearTimeoutForId]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      pushToast,
      dismissToast,
      clearToasts,
      pinToast,
    }),
    [toasts, pushToast, dismissToast, clearToasts, pinToast]
  )

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

export function useToasts(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToasts must be used within a ToastProvider')
  }
  return ctx
}
