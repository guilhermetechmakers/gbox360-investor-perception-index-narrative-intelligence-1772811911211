import { Pin, PinOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ToastData } from './toast-types'

/** Toast type styles using design tokens only (no hardcoded colors). */
const TYPE_STYLES: Record<string, string> = {
  default: 'border-border bg-card',
  success: 'border-success/30 bg-card',
  error: 'border-destructive/30 bg-card',
  warning: 'border-accent/30 bg-card',
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
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel}
      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </Button>
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
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={pinned ? 'Unpin toast' : 'Pin toast'}
      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      {pinned ? (
        <PinOff className="h-4 w-4" />
      ) : (
        <Pin className="h-4 w-4" />
      )}
    </Button>
  )
}

export function Toast({ toast, onDismiss, onPinChange }: ToastProps) {
  const typeStyle = TYPE_STYLES[toast.type ?? 'default'] ?? TYPE_STYLES.default
  const canDismiss = toast.dismissible !== false
  const title = toast.title?.trim() || 'Notification'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className={cn(
        'flex min-w-[280px] max-w-md items-start gap-3 rounded-[10px] border px-4 py-3 shadow-card transition-shadow duration-200',
        'animate-fade-in-up',
        'sm:min-w-[300px]',
        typeStyle
      )}
    >
      <div className="min-w-0 flex-1 pt-0.5">
        <h2 className="text-sm font-medium text-foreground">
          {title}
        </h2>
        {toast.description?.trim() ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {toast.description.trim()}
          </p>
        ) : null}
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
