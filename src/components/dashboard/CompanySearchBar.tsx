import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { useCompanySearch } from '@/hooks/useCompanies'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanySearchResult } from '@/types/company'

interface CompanySearchBarProps {
  onSelect: (company: CompanySearchResult) => void
  placeholder?: string
  className?: string
  initialQuery?: string
}

export function CompanySearchBar({
  onSelect,
  placeholder = 'Search company...',
  className,
  initialQuery = '',
}: CompanySearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 200)

  const { data: suggestions = [], isLoading } = useCompanySearch(debouncedQuery)
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []

  const handleSelect = useCallback(
    (company: CompanySearchResult) => {
      onSelect(company)
      setQuery(company.name)
      setIsOpen(false)
      setHighlightIndex(0)
    },
    [onSelect]
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setHighlightIndex(0)
  }, [debouncedQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || safeSuggestions.length === 0) {
      if (e.key === 'Escape') setIsOpen(false)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, safeSuggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        handleSelect(safeSuggestions[highlightIndex])
        break
      case 'Escape':
        setIsOpen(false)
        break
      default:
        break
    }
  }

  const showDropdown = isOpen && (query.length >= 2 || safeSuggestions.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-4"
          aria-label="Search for a company"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="company-suggestions"
          aria-activedescendant={
            showDropdown && safeSuggestions[highlightIndex]
              ? `suggestion-${highlightIndex}`
              : undefined
          }
        />
      </div>
      {showDropdown && (
        <ul
          id="company-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-card py-1 shadow-lg animate-fade-in-down"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">Searching...</li>
          ) : safeSuggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No companies found. Try a different search.
            </li>
          ) : (
            safeSuggestions.map((company, i) => (
              <li
                key={company.id}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlightIndex}
                className={cn(
                  'cursor-pointer px-4 py-2 text-sm transition-colors',
                  i === highlightIndex ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted',
                  'focus:bg-muted outline-none'
                )}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleSelect(company)}
              >
                <span className="font-medium">{company.name}</span>
                {company.ticker && (
                  <span className="ml-2 text-muted-foreground">({company.ticker})</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
