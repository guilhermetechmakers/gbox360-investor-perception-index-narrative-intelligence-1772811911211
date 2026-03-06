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

const ALLOWED_ROLES: UserRole[] = ['admin', 'operator', 'auditor', 'user']

export interface RoleSelectorProps {
  value: string[]
  onChange: (roles: string[]) => void
  disabled?: boolean
  className?: string
  allowMultiple?: boolean
}

export function RoleSelector({
  value,
  onChange,
  disabled = false,
  className,
  allowMultiple = true,
}: RoleSelectorProps) {
  const selected = value?.[0] ?? 'user'
  const handleChange = (v: string) => {
    const role = v
    if (allowMultiple && !(value ?? []).includes(role)) {
      onChange([...(value ?? []), role] as UserRole[])
    } else {
      onChange([role] as UserRole[])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Role</Label>
      <Select
        value={selected}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {ALLOWED_ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {allowMultiple && (value ?? []).length > 1 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {(value ?? []).map((r) => (
            <span
              key={r}
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-muted"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
