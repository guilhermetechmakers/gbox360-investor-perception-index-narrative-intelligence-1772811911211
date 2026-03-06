import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown, ChevronRight } from 'lucide-react'

export function ActivityAuditExportPanel() {
  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileDown className="h-5 w-5 text-muted-foreground" />
          Audit export
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Initiate signed audit artifact export for compliance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/audit-exports" className="flex items-center gap-2">
            Initiate export
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Select scope (company, time window), choose events, and generate signed JSON + PDF artifacts.
        </p>
      </CardContent>
    </Card>
  )
}
