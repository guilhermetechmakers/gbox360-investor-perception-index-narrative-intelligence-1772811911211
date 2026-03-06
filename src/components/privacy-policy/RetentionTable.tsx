import { cn } from '@/lib/utils'
import type { RetentionRow } from '@/types/privacy-policy'
import { FileQuestion } from 'lucide-react'

export interface RetentionTableProps {
  data?: RetentionRow[] | null
  className?: string
}

/**
 * Accessible data retention table.
 * Responsive: stacks on narrow viewports. Guards against non-array data.
 */
export function RetentionTable({ data, className }: RetentionTableProps) {
  const rows = Array.isArray(data) ? data : []
  const hasRows = rows.length > 0

  if (!hasRows) {
    return (
      <div
        role="status"
        aria-label="Data retention table empty"
        className={cn(
          'rounded-[10px] border border-border bg-card p-8 md:p-10',
          'flex flex-col items-center justify-center gap-4 text-center',
          'text-muted-foreground',
          className
        )}
      >
        <FileQuestion className="h-12 w-12 text-muted-foreground/50" aria-hidden />
        <p className="text-sm">Retention data is not available at the moment.</p>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="retention-table-heading"
      className={cn('rounded-[10px] border border-border bg-card overflow-hidden', className)}
    >
      <div className="p-6 md:p-7 border-b border-border">
        <h2
          id="retention-table-heading"
          className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.5rem]"
        >
          Data Retention
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Retention periods by data category
        </p>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className="w-full text-sm"
          role="table"
          aria-label="Data retention by category"
        >
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th
                scope="col"
                className="text-left py-4 px-6 font-semibold text-foreground"
              >
                Category
              </th>
              <th
                scope="col"
                className="text-left py-4 px-6 font-semibold text-foreground"
              >
                Retention Period
              </th>
              <th
                scope="col"
                className="text-left py-4 px-6 font-semibold text-foreground"
              >
                Rationale
              </th>
              <th
                scope="col"
                className="text-left py-4 px-6 font-semibold text-foreground"
              >
                Archiving Method
              </th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row, index) => (
              <tr
                key={row?.id ?? row?.category ?? `row-${index}`}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-foreground">
                  {row?.category ?? ''}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {row?.retentionPeriod ?? ''}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {row?.rationale ?? ''}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {row?.archivingMethod ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden divide-y divide-border">
        {(rows ?? []).map((row, index) => (
          <div
            key={row?.id ?? row?.category ?? `row-${index}`}
            className="p-6 space-y-3"
          >
            <h3 className="font-semibold text-foreground">{row?.category ?? ''}</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Retention period</dt>
                <dd className="text-foreground mt-0.5">{row?.retentionPeriod ?? ''}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Rationale</dt>
                <dd className="text-foreground mt-0.5">{row?.rationale ?? ''}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Archiving method</dt>
                <dd className="text-foreground mt-0.5">{row?.archivingMethod ?? ''}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
