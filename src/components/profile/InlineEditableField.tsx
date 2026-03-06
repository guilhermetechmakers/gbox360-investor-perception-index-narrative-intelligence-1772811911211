import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InlineEditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => void | Promise<void>
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  isSaving?: boolean
  /** Input type */
  type?: 'text' | 'email'
  /** Validation - return error message or null */
  validate?: (value: string) => string | null
  className?: string
}

export function InlineEditableField({
  label,
  value,
  onSave,
  placeholder,
  maxLength = 100,
  disabled = false,
  isSaving = false,
  type = 'text',
  validate,
  className,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [error, setError] = useState<string | null>(null)

  const handleStartEdit = () => {
    if (disabled) return
    setEditValue(value)
    setError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditValue(value)
    setError(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmed = editValue.trim()
    if (validate) {
      const err = validate(trimmed)
      if (err) {
        setError(err)
        return
      }
    }
    setError(null)
    await onSave(trimmed)
    setIsEditing(false)
  }

  const hasChanges = editValue.trim() !== value

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.slice(0, maxLength))}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isSaving}
            className={cn(
              'flex-1 transition-colors duration-150',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'inline-error' : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-success hover:bg-success/10 hover:text-success"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            aria-label="Save"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-muted-foreground hover:bg-muted"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleStartEdit}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault()
              handleStartEdit()
            }
          }}
          className={cn(
            'flex items-center justify-between rounded-md border border-border px-3 py-2.5',
            'transition-all duration-200 hover:border-accent/30 hover:bg-muted/30',
            !disabled && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label={`Edit ${label}`}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {value || placeholder || '—'}
          </span>
          {!disabled && (
            <span className="text-xs text-muted-foreground">Click to edit</span>
          )}
        </div>
      )}
      {error && (
        <p id="inline-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
