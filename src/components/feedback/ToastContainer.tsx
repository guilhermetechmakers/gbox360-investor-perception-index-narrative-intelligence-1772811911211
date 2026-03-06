import { useToasts } from './ToastContext'
import { Toast } from './Toast'
import { cn } from '@/lib/utils'

export type ToastPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface ToastContainerProps {
  /** Position of the toast stack */
  position?: ToastPosition
  /** Additional class names */
  className?: string
}

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
}

export function ToastContainer({
  position = 'bottom-right',
  className,
}: ToastContainerProps) {
  const { toasts, dismissToast, pinToast } = useToasts()
  const safeToasts = Array.isArray(toasts) ? toasts : []

  if (safeToasts.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col-reverse gap-3',
        POSITION_CLASSES[position],
        className
      )}
      aria-label="Notifications"
    >
      {safeToasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          onPinChange={pinToast}
        />
      ))}
    </div>
  )
}
