import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PinOff, Star, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Company } from '@/types/company'

export interface SavedCompanyWithScore extends Company {
  score?: number
  lastViewed?: string
  pinned?: boolean
}

interface SavedCompaniesPaneProps {
  savedCompanies: SavedCompanyWithScore[]
  onSelectCompany: (company: SavedCompanyWithScore) => void
  onUnpin?: (companyId: string) => void
  selectedCompanyId?: string | null
  windowStart: string
  windowEnd: string
  /** When set, the unpin button for this company shows a loading state */
  removingCompanyId?: string | null
}

export function SavedCompaniesPane({
  savedCompanies,
  onSelectCompany,
  onUnpin,
  selectedCompanyId,
  windowStart,
  windowEnd,
  removingCompanyId = null,
}: SavedCompaniesPaneProps) {
  const items = Array.isArray(savedCompanies) ? savedCompanies : []

  return (
    <Card className="rounded-[10px] border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" aria-hidden />
          Saved companies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 px-4 text-center"
            role="status"
            aria-label="No saved companies"
          >
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground" aria-hidden />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No saved companies yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              Search for a company above and save it to track IPI and view it here.
            </p>
            <p className="text-xs text-muted-foreground">
              Use the search bar, then click the star to save.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <ul className="space-y-1" role="list" aria-label="Saved companies list">
              {items.map((company) => {
                const isSelected = selectedCompanyId === company.id
                const isRemoving = removingCompanyId === company.id
                return (
                  <li key={company.id}>
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                        'hover:bg-muted cursor-pointer',
                        isSelected && 'bg-muted border-l-2 border-accent'
                      )}
                    >
                      <Link
                        to={`/dashboard/company/${company.id}?start=${windowStart}&end=${windowEnd}`}
                        className="flex-1 min-w-0"
                        onClick={() => onSelectCompany(company)}
                        aria-label={`View ${company.name}${company.ticker ? ` (${company.ticker})` : ''} company details`}
                      >
                        <span className="font-medium truncate block">{company.name}</span>
                        {company.ticker && (
                          <span className="text-xs text-muted-foreground">
                            {company.ticker}
                            {typeof company.score === 'number' && (
                              <> · {company.score.toFixed(1)} IPI</>
                            )}
                          </span>
                        )}
                      </Link>
                      {onUnpin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 min-w-[44px] min-h-[44px]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onUnpin(company.id)
                          }}
                          disabled={isRemoving}
                          aria-label={`Remove ${company.name} from saved companies`}
                          aria-busy={isRemoving}
                        >
                          {isRemoving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
                          ) : (
                            <PinOff className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
