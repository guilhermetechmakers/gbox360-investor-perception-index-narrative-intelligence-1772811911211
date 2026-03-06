import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

export interface LogTableColumn<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface LogTableProps<T> {
  columns: LogTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
  /** When true, shows skeleton rows instead of data. */
  isLoading?: boolean
  /** When set, shows error state with message and optional retry. */
  error?: Error | string | null
  /** Called when user clicks retry in error state. */
  onRetry?: () => void
  /** Message shown when data is empty. */
  emptyMessage?: string
  /** Accessible name for the table. */
  'aria-label'?: string
}

const DEFAULT_EMPTY_MESSAGE = 'No data to display.'
const SKELETON_ROW_COUNT = 5

function getErrorMessage(error: Error | string | null): string {
  if (error == null) return ''
  return typeof error === 'string' ? error : error.message ?? 'Something went wrong.'
}

export function LogTable<T extends object>({
  columns,
  data = [],
  keyExtractor,
  onRowClick,
  className,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  'aria-label': ariaLabel,
}: LogTableProps<T>) {
  const rows = Array.isArray(data) ? data : []
  const hasError = error != null && getErrorMessage(error).length > 0
  const errorMessage = getErrorMessage(error)

  const tableId = 'log-table'
  const tableLabel = ariaLabel ?? 'Data table'

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-[10px] border border-border overflow-hidden bg-card shadow-card animate-fade-in',
          className
        )}
        role="region"
        aria-label={`${tableLabel}, loading`}
        aria-busy="true"
      >
        <div className="overflow-x-auto">
          <Table aria-label={tableLabel}>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                {columns.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className={cn('text-muted-foreground border-border', col.className)}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <TableRow key={i} className="border-border hover:bg-transparent">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn('border-border', col.className)}>
                      <Skeleton className="h-5 w-full min-w-[4rem] rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'rounded-[10px] border border-border bg-card shadow-card p-8 text-center animate-fade-in',
          'flex flex-col items-center justify-center gap-4 min-h-[200px]',
          className
        )}
        role="alert"
        aria-live="assertive"
        aria-label="Error loading table data"
      >
        <AlertCircle
          className="h-10 w-10 text-destructive shrink-0"
          aria-hidden
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Unable to load data</p>
          <p className="text-sm text-muted-foreground max-w-md">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Retry loading data"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          'rounded-[10px] border border-border border-dashed bg-muted/30 overflow-hidden',
          'flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in',
          className
        )}
        role="status"
        aria-label="Table is empty"
      >
        <FileText
          className="h-10 w-10 text-muted-foreground shrink-0 mb-3"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const handleRowKeyDown = (row: T, e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!onRowClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRowClick(row)
    }
  }

  return (
    <div
      className={cn(
        'rounded-[10px] border border-border overflow-hidden bg-card shadow-card animate-fade-in',
        className
      )}
      role="region"
      aria-label={tableLabel}
    >
      <div className="overflow-x-auto">
        <Table id={tableId} aria-label={tableLabel}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn('text-muted-foreground border-border', col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const key = keyExtractor(row)
              const isClickable = Boolean(onRowClick)
              return (
                <TableRow
                  key={key}
                  tabIndex={isClickable ? 0 : undefined}
                  role={isClickable ? 'button' : undefined}
                  aria-label={isClickable ? `View row ${index + 1} of ${rows.length}` : undefined}
                  className={cn(
                    'border-border transition-colors duration-200',
                    isClickable &&
                      'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={isClickable ? (e) => handleRowKeyDown(row, e) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn('border-border', col.className)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
