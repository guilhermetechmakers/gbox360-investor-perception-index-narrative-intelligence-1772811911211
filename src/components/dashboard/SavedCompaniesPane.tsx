import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PinOff, Star } from 'lucide-react'
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
}

export function SavedCompaniesPane({
  savedCompanies,
  onSelectCompany,
  onUnpin,
  selectedCompanyId,
  windowStart,
  windowEnd,
}: SavedCompaniesPaneProps) {
  const items = Array.isArray(savedCompanies) ? savedCompanies : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          Saved companies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No saved companies yet. Search and save companies to see them here.
          </p>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <ul className="space-y-1">
              {items.map((company) => {
                const isSelected = selectedCompanyId === company.id
                return (
                  <li key={company.id}>
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-muted cursor-pointer',
                        isSelected && 'bg-muted border-l-2 border-accent'
                      )}
                    >
                      <Link
                        to={`/dashboard/company/${company.id}?start=${windowStart}&end=${windowEnd}`}
                        className="flex-1 min-w-0"
                        onClick={() => onSelectCompany(company)}
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
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onUnpin(company.id)
                          }}
                          aria-label={`Remove ${company.name} from saved`}
                        >
                          <PinOff className="h-4 w-4" />
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
