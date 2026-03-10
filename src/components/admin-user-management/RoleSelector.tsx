import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/types/admin'
import { cn } from '@/lib/utils'
import { useId } from 'react'
import { Shield, Loader2, AlertCircle } from 'lucide-react'

const ALLOWED_ROLES: UserRole[] = ['admin', 'operator', 'auditor', 'user']

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  operator: 'Operator',
  auditor: 'Auditor',
  user: 'User',
}

export interface RoleSelectorProps {
  value: string[]
  onChange: (roles: string[]) => void
  disabled?: boolean
  className?: string
  allowMultiple?: boolean
  /** When true, shows loading skeleton and disables interaction */
  isLoading?: boolean
  /** When set, shows error message and error styling */
  error?: string
}

export function RoleSelector({
  value,
  onChange,
  disabled = false,
  className,
  allowMultiple = true,
  isLoading = false,
  error,
}: RoleSelectorProps) {
  const id = useId()
  const selected = value?.[0] ?? 'user'
  const handleChange = (v: string) => {
    const role = v
    if (allowMultiple && !(value ?? []).includes(role)) {
      onChange([...(value ?? []), role] as UserRole[])
    } else {
      onChange([role] as UserRole[])
    }
  }

  const isDisabled = disabled || isLoading
  const hasError = Boolean(error?.trim())

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className={cn(
          'flex items-center gap-2 text-sm font-medium leading-none text-foreground',
          isDisabled && 'cursor-not-allowed opacity-70'
        )}
      >
        <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
        Role
      </Label>
      {isLoading ? (
        <div
          className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 animate-pulse"
          aria-busy="true"
          aria-label="Loading roles"
        >
          <span className="h-4 w-8 rounded bg-muted-foreground/20" />
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : (
        <Select
          value={selected}
          onValueChange={handleChange}
          disabled={isDisabled}
        >
          <SelectTrigger
            id={id}
            className={cn(
              'w-full transition-[box-shadow,border-color] duration-200',
              hasError &&
                'border-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive'
            )}
            aria-label="Select user role"
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          >
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {(ALLOWED_ROLES ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <Shield className="h-8 w-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm text-muted-foreground">No roles available</p>
              </div>
            ) : (
              (ALLOWED_ROLES ?? []).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      {allowMultiple && (value ?? []).length > 1 && !isLoading && (
        <div className="flex flex-wrap gap-2 mt-2">
          {(value ?? []).map((r) => (
            <span
              key={r}
              className={cn(
                'inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground',
                'transition-shadow duration-150 hover:shadow-sm'
              )}
            >
              {ROLE_LABELS[r as UserRole] ?? r}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
