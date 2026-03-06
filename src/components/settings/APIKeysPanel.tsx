import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, Lock } from 'lucide-react'

export function APIKeysPanel() {
  return (
    <Card className="card-surface border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          Developer / API keys
          <Badge variant="secondary" className="text-xs">
            Enterprise
          </Badge>
        </CardTitle>
        <CardDescription>
          API keys for programmatic access to Gbox360. Available on enterprise plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Coming soon</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              API key management is not available in the current plan. Contact your
              administrator or sales to enable enterprise features.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
