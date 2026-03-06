import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, ExternalLink, PinOff, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Company } from '@/types/company'
import { EmptyState } from './EmptyState'
import { useRemoveSavedCompany } from '@/hooks/useCompanies'

export interface SavedCompaniesPanelProps {
  savedCompanies: Company[]
  isLoading?: boolean
  timeWindow?: { start: string; end: string }
}

export function SavedCompaniesPanel({
  savedCompanies,
  isLoading = false,
  timeWindow,
}: SavedCompaniesPanelProps) {
  const removeSaved = useRemoveSavedCompany()
  const items = Array.isArray(savedCompanies) ? savedCompanies : []

  if (isLoading) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-accent" />
          Saved companies
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick access from dashboard
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No saved companies"
            description="Search and save companies from the dashboard to see them here."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            }
          />
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <ul className="space-y-1">
              {(items ?? []).map((company) => {
                const href = timeWindow
                  ? `/dashboard/company/${company.id}?start=${timeWindow.start}&end=${timeWindow.end}`
                  : `/dashboard/company/${company.id}`
                return (
                  <li key={company.id}>
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5',
                        'transition-all duration-200 hover:border-accent/30 hover:shadow-sm'
                      )}
                    >
                      <Link
                        to={href}
                        className="flex min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {company.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {company.ticker && (
                                <Badge variant="accent" className="text-xs font-normal">
                                  {company.ticker}
                                </Badge>
                              )}
                              {typeof (company as { score?: number }).score === 'number' && (
                                <span className="text-xs text-muted-foreground">
                                  {(company as { score?: number }).score?.toFixed(1)} IPI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link to={href} aria-label={`Open ${company.name}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSaved.mutate(company.id)}
                          disabled={removeSaved.isPending}
                          aria-label={`Remove ${company.name} from saved`}
                        >
                          <PinOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
        {items.length > 0 && (
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link to="/dashboard">
              <Building2 className="mr-2 h-4 w-4" />
              Add more from dashboard
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
