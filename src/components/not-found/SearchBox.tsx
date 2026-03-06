import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBoxProps {
  onSubmit?: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBox({
  onSubmit,
  placeholder = 'Search for a company, report, or topic…',
  className,
}: SearchBoxProps) {
  const [value, setValue] = useState<string>('')
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const trimmed = (value ?? '').toString().trim()
      if (!trimmed) return

      if (typeof onSubmit === 'function') {
        onSubmit(trimmed)
      } else {
        navigate(`/dashboard?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [value, onSubmit, navigate]
  )

  const displayValue = value ?? ''

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('relative w-full max-w-xl', className)}
      aria-label="Search for a company, report, or topic"
    >
      <Search
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <Input
        type="search"
        value={displayValue}
        onChange={(e) => setValue(String(e.target?.value ?? ''))}
        placeholder={placeholder}
        className="h-12 pl-12 pr-4 rounded-xl border-border bg-card text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-150"
        aria-label="Search for a company, report, or topic"
        autoComplete="off"
      />
    </form>
  )
}
