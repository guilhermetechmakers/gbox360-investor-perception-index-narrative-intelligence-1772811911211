import { Pin, PinOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastData } from './toast-types'

const TYPE_STYLES: Record<string, string> = {
  default: 'border-border bg-card',
  success: 'border-success/30 bg-card',
  error: 'border-destructive/30 bg-card',
  warning: 'border-amber-500/30 bg-card',
  info: 'border-ring/30 bg-card',
}

export interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
  onPinChange?: (id: string, pinned: boolean) => void
}

function DismissButton({
  onClick,
  ariaLabel = 'Dismiss',
}: {
  onClick: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <X className="h-4 w-4" />
    </button>
  )
}

function PinButton({
  pinned,
  onClick,
}: {
  pinned: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={pinned ? 'Unpin toast' : 'Pin toast'}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {pinned ? (
        <PinOff className="h-4 w-4" />
      ) : (
        <Pin className="h-4 w-4" />
      )}
    </button>
  )
}

export function Toast({ toast, onDismiss, onPinChange }: ToastProps) {
  const typeStyle = TYPE_STYLES[toast.type ?? 'default'] ?? TYPE_STYLES.default
  const canDismiss = toast.dismissible !== false

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-w-[280px] max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-card',
        'animate-fade-in-up',
        typeStyle
      )}
    >
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {typeof onPinChange === 'function' && (
          <PinButton
            pinned={toast.pinned ?? false}
            onClick={() => onPinChange(toast.id, !toast.pinned)}
          />
        )}
        {canDismiss && (
          <DismissButton onClick={() => onDismiss(toast.id)} />
        )}
      </div>
    </div>
  )
}
